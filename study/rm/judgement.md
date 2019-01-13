#裁判系统数据读取探索
RM备赛期间遇到需要读取裁判系统的数据，在此将学习过程记录下来。因为RM2019的裁判系统的通信协议还没有出来，所以我学习的是RM2018版的裁判系统的数据获取。
#USART配置
我这里选用的是USART2，采用异步通信模式，并使能DMA，同时打开串口全局中断和DMA中断，波特率115200，数据位8位，停止位1位，无奇偶校验位。

因为裁判系统的数据不是定长的，所以采取串口空闲中断+DMA的方式读取，大致思路是设置很长的一个缓存区给DMA进行数据接收，然后在串口空闲中断中获取数据长度和信息，并采用队列的方法将此时DMA的数据位置保存为指针，方便下一次串口空闲中断时从上一次的位置继续读取数据。
##串口空闲中断
串口空闲中断与普通的串口中断不同，它是在接收到一帧数据后才会进入一次中断。在单片机接收到一个字节的时候（RXNE位被置位）并不会产生串口中断，而是DMA在后台把数据默默地搬运到你指定的缓冲区里面。当整帧数据发送完毕之后（接收停顿超过一字节时间）串口才会产生一次中断。

串口空闲中断开启步骤：
```c
__HAL_UART_CLEAR_IDLEFLAG(&huart2);
__HAL_UART_ENABLE_IT(&huart2, UART_IT_IDLE);
```
上面两句话就开启了我的USART2的空闲中断(IDLE)

然后给我的串口加上DMA双缓冲模式。
```c
SET_BIT(huart2.Instance->CR3, USART_CR3_DMAR);

DMAEx_MultiBufferStart_IT(huart2.hdmarx, \
                           (uint32_t)&huart2.Instance->DR, \
                           (uint32_t)judge_dma_rxbuff[0], \
                           (uint32_t)judge_dma_rxbuff[1], \
                           UART_RX_DMA_SIZE);
```
那么什么是DMA双缓冲模式呢？
#DMA双缓冲模式
DMA双缓冲模式有以下特点：
* 除了有两个存储器指针之外，双缓冲区数据流的工作方式与常规（单缓冲区）数据流的一样。
* 使能双缓冲区模式时，将自动使能循环模式，并在每次事务结束时交换存储器指针。
* DMA正在访问的当前存储区由DMA_SxCR表示
>CT：当前目标 
CT = 0：DMA正在访问存储区0，CPU可以访问存储区1
CT = 1：DMA正在访问存储区1，CPU可以访问存储区0

**好处：**
>使用DMA双缓冲传输，既可以减少CPU的负荷，又能最大程度地实现DMA数据传输和CPU数据处理互不打扰又互不耽搁，DMA双缓冲模式的循环特性，使用它对存储区的空间容量要求也会大大降低。尤其在大批量数据传送时，你只需开辟两个合适大小的存储区，能满足DMA在切换存储区时的当前新存储区空出来就好，并不一定要开辟多大多深的存储空间，单纯一味地加大双缓冲区的深度并不明显改善数据传输状况。

引用自博客[DMA双缓冲模式](https://blog.csdn.net/qq_19999465/article/details/81054680)

而裁判系统的数据量很大，很适合用DMA双缓冲模式。另外我用上了FreeRTOS操作系统，把具体的解析函数放在线程里面，通过在中断中发送信号量来驱动线程。

好，现在来看上面的开启双缓冲的代码是怎么实现的。

* 第一句：
```c
SET_BIT(huart2.Instance->CR3, USART_CR3_DMAR);
```
USART中有`CR1`，`CR2`和`CR3`这三个寄存器，其中CR1来设置数据位是8位还是9位，CR2设置停止位，CR3设置DMA缓冲方式，而`USART_CR3_DMAR`代表的正好就是DMA使能，在HAL库中它的定义如下：
```c
#define USART_CR3_DMAR     USART_CR3_DMAR_Msk                       /*!<DMA Enable Receiver         */
```
* 第二句
```c
DMAEx_MultiBufferStart_IT(huart2.hdmarx, \
                           (uint32_t)&huart2.Instance->DR, \
                           (uint32_t)judge_dma_rxbuff[0], \
                           (uint32_t)judge_dma_rxbuff[1], \
                           UART_RX_DMA_SIZE);
```
这里的`judge_dma_rxbuff`和`UART_RX_DMA_SIZE`定义如下：
```c
int UART_RX_DMA_SIZE = 1024;
uint8_t judge_dma_rxbuff[2][1024];
```
这里直接使用了长达1024的两个数组缓存裁判系统的发送回来的数据。

上面这个函数的定义如下：
```c
static HAL_StatusTypeDef DMAEx_MultiBufferStart_IT(DMA_HandleTypeDef *hdma, \
                                                   uint32_t SrcAddress, \
                                                   uint32_t DstAddress, \
                                                   uint32_t SecondMemAddress, \
                                                   uint32_t DataLength)
{
  HAL_StatusTypeDef status = HAL_OK;
  
  /* Memory-to-memory transfer not supported in double buffering mode */
  if (hdma->Init.Direction == DMA_MEMORY_TO_MEMORY)
  {
    hdma->ErrorCode = HAL_DMA_ERROR_NOT_SUPPORTED;
    return HAL_ERROR;
  }
  
  /* Set the UART DMA transfer complete callback */
  /* Current memory buffer used is Memory 1 callback */
  hdma->XferCpltCallback   = dma_m0_rxcplt_callback;
  /* Current memory buffer used is Memory 0 callback */
  hdma->XferM1CpltCallback = dma_m1_rxcplt_callback;
  
  /* Check callback functions */
  if ((NULL == hdma->XferCpltCallback) || (NULL == hdma->XferM1CpltCallback))
  {
    hdma->ErrorCode = HAL_DMA_ERROR_PARAM;
    return HAL_ERROR;
  }
  
  /* Process locked */
  __HAL_LOCK(hdma);
  
  if(HAL_DMA_STATE_READY == hdma->State)
  {
    /* Change DMA peripheral state */
    hdma->State = HAL_DMA_STATE_BUSY;
    /* Initialize the error code */
    hdma->ErrorCode = HAL_DMA_ERROR_NONE;
    /* Enable the Double buffer mode */
    hdma->Instance->CR |= (uint32_t)DMA_SxCR_DBM;
    /* Configure DMA Stream destination address */
    hdma->Instance->M1AR = SecondMemAddress;
    
    /* Configure DMA Stream data length */
    hdma->Instance->NDTR = DataLength;
    /* Configure the source, destination address */
    if((hdma->Init.Direction) == DMA_MEMORY_TO_PERIPH)
    {
      hdma->Instance->PAR = DstAddress;
      hdma->Instance->M0AR = SrcAddress;
    }
    else
    {
      hdma->Instance->PAR = SrcAddress;
      hdma->Instance->M0AR = DstAddress;
    }
    
    /* Clear TC flags */
    __HAL_DMA_CLEAR_FLAG (hdma, __HAL_DMA_GET_TC_FLAG_INDEX(hdma));
    /* Enable TC interrupts*/
    hdma->Instance->CR  |= DMA_IT_TC;
    
    /* Enable the peripheral */
    __HAL_DMA_ENABLE(hdma);
    
    /* Change the DMA state */
    hdma->State = HAL_DMA_STATE_READY;
  }
  else
  {
    /* Return error status */
    status = HAL_BUSY;
  }
  
  /* Process unlocked */
  __HAL_UNLOCK(hdma);
  
  return status; 
}
```
好，现在USART2的串口空闲中断和DMA双缓冲模式都已经配置好了，接下来写中断函数。
#串口空闲中断函数
这里我直接在`stm32f4xx_it.c`中修改中断函数。
```c
void USART2_IRQHandler(void)
{
  /* USER CODE BEGIN USART2_IRQn 0 */
  uart_receive_handler(&huart2);
  /* USER CODE END USART2_IRQn 0 */
  HAL_UART_IRQHandler(&huart2);
  /* USER CODE BEGIN USART2_IRQn 1 */

  /* USER CODE END USART2_IRQn 1 */
}
```
上面的`uart_receive_handle(&huart2)`是我定义的串口空闲中断函数。它的实现如下：
```c
void uart_receive_handler(UART_HandleTypeDef *huart)
{
  if (__HAL_UART_GET_FLAG(huart, UART_FLAG_IDLE) &&
      __HAL_UART_GET_IT_SOURCE(huart, UART_IT_IDLE))
  {
    uart_rx_idle_callback(huart);
  }
}
```
这里很简单，就是在中断里面判断是不是一帧数据已经发送完了，以及是不是由串口空闲中断引起的中断，如果是就执行串口空闲中断回调函数`uart_rx_idle_callback(huart);`。
```c
void uart_rx_idle_callback(UART_HandleTypeDef* huart)
{
  /* clear idle it flag avoid idle interrupt all the time */
  __HAL_UART_CLEAR_IDLEFLAG(huart);

  /* handle received data in idle interrupt */
	if (huart == &huart2) 
  {
    //osSignalSet(judge_unpack_task_t, JUDGE_UART_IDLE_SIGNAL);
    //HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_14);
    osSemaphoreRelease(JudgementSignalHandle);
  }

}
```
上面的代码也很简单，首先清楚中断标志位，然后发送一个信号量，通知对应的操作系统线程开始运行。
#数据存储
现在就进入线程里面把数据存储下来了。
```c
void JudgementReceive(void const * argument)
{

  /* USER CODE BEGIN JudgementReceive */
  judgement_uart_init();
  /* Infinite loop */
  for(;;)
  {
    osSemaphoreWait(JudgementSignalHandle, osWaitForever);
    HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_14);
    JudgementDataReceive();
  }
  /* USER CODE END JudgementReceive */
}
```
终于看到最重要的处理函数`JudgementDataReceive`了，然后我在这里顺便闪灯指示。

**但是**！在看这个函数执行之前，需要执行一个初始化函数，我把它写在main函数里面，在操作系统初始化之前执行。
```c
int main()
{
	//外设初始化语句...
	communicate_param_init();
  while(1)
  {
    //you should not write any code here...
  }
}
```
这个函数叫做`communicate_param_init();`，它的具体内容如下：
```c
void communicate_param_init(void)
{
  /* judge data fifo init */
  fifo_s_init(&judge_rxdata_fifo, judge_rxdata_buf, JUDGE_FIFO_BUFLEN);
  fifo_s_init(&judge_txdata_fifo, judge_txdata_buf, JUDGE_FIFO_BUFLEN);


  /* initial judge data dma receiver object */
  judge_rx_obj.huart = &huart2;
  judge_rx_obj.data_fifo = &judge_rxdata_fifo;
  judge_rx_obj.buff_size = UART_RX_DMA_SIZE;
  judge_rx_obj.buff[0] = judge_dma_rxbuff[0];
  judge_rx_obj.buff[1] = judge_dma_rxbuff[1];


  /* initial judge data unpack object */
  judge_unpack_obj.data_fifo = &judge_rxdata_fifo;
  judge_unpack_obj.p_header = (frame_header_t *)judge_unpack_obj.protocol_packet;
  judge_unpack_obj.index = 0;
  judge_unpack_obj.data_len = 0;
  judge_unpack_obj.unpack_step = STEP_HEADER_SOF;  

}
```
上面的函数主要有三部分，第一部分是裁判系统发送过来的数据以及我们发送给裁判系统的数据的队列*（FIFO）*。第二部分是用于存储裁判系统数据的结构体，第三部分是用于解析裁判系统数据的结构体。下面一部分一部分来看：
##FIFO
先看看上面那个函数的实现：
```c
int32_t fifo_s_init(fifo_s_t* pfifo, void* base_addr, uint32_t unit_cnt, osMutexId mutex)
{
  if (mutex != NULL)
  {
    //! Initialize FIFO Control Block.
    pfifo->start_addr  = (uint8_t*) base_addr;
    pfifo->end_addr    = (uint8_t*) base_addr + unit_cnt - 1;
    pfifo->buf_size    = unit_cnt;
    pfifo->free        = unit_cnt;
    pfifo->used        = 0;
    pfifo->read_index  = 0;
    pfifo->write_index = 0;
    return 0;
  }
  else
  {
    return -1;
  }
}
```
这其中涉及到一个结构体：
```c
typedef struct
{
  uint8_t   *start_addr;                   //Start Address
  uint8_t   *end_addr;                     //End Address
  uint32_t  free;                         //The capacity of FIFO
  uint32_t  buf_size;                     //Buffer size
  uint32_t  used;                         //The number of elements in FIFO
  uint8_t   read_index;                   //Read Index Pointer
  uint8_t   write_index;                  //Write Index Pointer
} fifo_s_t;
```
这里用到了C语言的队列功能*（FIFO）*。定义了两个队列`judge_rxdata_fifo`，`judge_txdata_fifo`。

FIFO，即先入先出（first input first output），具体的还不太懂，待后续更新。

---
回到前面的函数，第二部分是关于一个叫`judge_rx_obj`的结构体，该结构体的定义如下：
```c
typedef struct
{
  UART_HandleTypeDef *huart;
  fifo_s_t           *data_fifo;
  uint16_t           buff_size;
  uint8_t            *buff[2];
  uint16_t           read_index;
  uint16_t           write_index;
} uart_dma_rxdata_t;

uart_dma_rxdata_t judge_rx_obj;
```
在上面的函数中将这个结构体与对应的接收消息的队列绑在了一起。

第三部分也是一个结构体，从名字推测应该是数据解析时所使用的结构体。
```c
typedef struct
{
  fifo_s_t       *data_fifo;
  frame_header_t *p_header;
  uint16_t       data_len;
  uint8_t        protocol_packet[PROTOCAL_FRAME_MAX_SIZE];
  unpack_step_e  unpack_step;
  uint16_t       index;
} unpack_data_t;

unpack_data_t judge_unpack_obj;
```
它也与接收消息的队列`judgement_rxdata_fifo`联系在一起。其中的`frame_header_t`定义如下：
```c
typedef __packed struct
{
  uint8_t  sof;
  uint16_t data_length;
  uint8_t  seq;
  uint8_t  crc8;
} frame_header_t;
```
这是裁判系统的FrameHeader帧的格式。

上面的函数初始化了数据队列，指定了队列的起始地址和结束地址，缓冲内存大小，剩余内存大小和读写数据的位。

另外该函数还配置了两个结构体`judge_rx_obj`，`judge_unpack_obj`的一些选项，`judge_rx_obj`结构体很好理解，就是指定串口号，数据存储的队列，缓冲大小和DMA双缓冲对应的两个缓冲数组。

第二个结构体`judge_unpack_obj`首先指定了数据队列，然后将队列的初始指针指向了FrameHeader帧的帧头，数组序号设为0，数据长度设为0，解析步骤设为第一步`STEP_HEADER_SOF`。

解析的步骤定义在了下面的枚举量中：
```c
typedef enum
{
  STEP_HEADER_SOF  = 0,
  STEP_LENGTH_LOW  = 1,
  STEP_LENGTH_HIGH = 2,
  STEP_FRAME_SEQ   = 3,
  STEP_HEADER_CRC8 = 4,
  STEP_DATA_CRC16  = 5,
} unpack_step_e;
```

---
好，到现在为止所有的初始化步骤（串口配置，DMA配置，数组、队列、结构体配置）均已完成了，现在终于可以进入前面遇到的`JudgementDataReceive`函数了。
#数据解析
现在贴出这个函数的内容：
```c
void JudgementDataReceive()
{
  dma_buffer_to_unpack_buffer(&judge_rx_obj, UART_IDLE_IT);
  unpack_fifo_data(&judge_unpack_obj, DN_REG_ID);
}
```
这里面有两个函数，从函数名可以看出第一个函数是将DMA储存的数据转移到解析用的缓存中，第二个函数是解析数据的具体逻辑。

* 先看第一个函数：
```c
dma_buffer_to_unpack_buffer(&judge_rx_obj, UART_IDLE_IT);
```
这里有一个变量`UART_IDLE_IT`，它被定义在下面的枚举量汇中：
```c
typedef enum
{
  UART_IDLE_IT     = 0,
  UART_DMA_HALF_IT = 1,
  UART_DMA_FULL_IT = 2,
} uart_it_type_e;
```
这里可以看出定义的是几种串口的中断模式，因为这里借鉴的官方的开源代码，那里面会涉及到好几种中断模式，所以定义了这个枚举量，其实单独使用的话是不需要定义这么多的。

这个函数的函数体如下：
```c
void dma_buffer_to_unpack_buffer(uart_dma_rxdata_t *dma_obj, uart_it_type_e it_type)
{
  int16_t  tmp_len;
  uint8_t  current_memory_id;
  uint16_t remain_data_counter;
  uint8_t  *pdata = dma_obj->buff[0];

  get_dma_memory_msg(dma_obj->huart->hdmarx->Instance, &current_memory_id, &remain_data_counter);

  if (UART_IDLE_IT == it_type)
  {
    if (current_memory_id)
    {
      dma_obj->write_index = dma_obj->buff_size*2 - remain_data_counter;
    }
    else
    {
      dma_obj->write_index = dma_obj->buff_size - remain_data_counter;
    }
  }
  else if (UART_DMA_FULL_IT == it_type)
  {
#if 0
    if (current_memory_id)
    {
      dma_obj->write_index = dma_obj->buff_size;
    }
    else
    {
      dma_obj->write_index = dma_obj->buff_size*2;
    }
#endif
  }

  if (dma_obj->write_index < dma_obj->read_index)
  {
    dma_write_len = dma_obj->buff_size*2 - dma_obj->read_index + dma_obj->write_index;    //这里为啥*2还没搞懂

    tmp_len = dma_obj->buff_size*2 - dma_obj->read_index;
    if (tmp_len != fifo_s_puts(dma_obj->data_fifo, &pdata[dma_obj->read_index], tmp_len))
      fifo_overflow = 1;
    else
      fifo_overflow = 0;
    dma_obj->read_index = 0;

    tmp_len = dma_obj->write_index;
    if (tmp_len != fifo_s_puts(dma_obj->data_fifo, &pdata[dma_obj->read_index], tmp_len))
      fifo_overflow = 1;
    else
      fifo_overflow = 0;
    dma_obj->read_index = dma_obj->write_index;
  }
  else
  {
    dma_write_len = dma_obj->write_index - dma_obj->read_index;

    tmp_len = dma_obj->write_index - dma_obj->read_index;
    if (tmp_len != fifo_s_puts(dma_obj->data_fifo, &pdata[dma_obj->read_index], tmp_len))
      fifo_overflow = 1;
    else
      fifo_overflow = 0;
    dma_obj->read_index = (dma_obj->write_index) % (dma_obj->buff_size*2);
  }
}
```
上面的代码中，已经把除串口空闲中断的其他中断对应的逻辑都注释掉了。

其中有一个获取DMA的缓冲通道和缓冲的数据长度的函数：
```c
void get_dma_memory_msg(DMA_Stream_TypeDef *dma_stream, uint8_t *mem_id, uint16_t *remain_cnt)
{
  *mem_id     = dma_current_memory_target(dma_stream);
  *remain_cnt = dma_current_data_counter(dma_stream);
}

uint8_t dma_current_memory_target(DMA_Stream_TypeDef *dma_stream)
{
  uint8_t tmp = 0;

  /* Get the current memory target */
  if ((dma_stream->CR & DMA_SxCR_CT) != 0)
  {
    /* Current memory buffer used is Memory 1 */
    tmp = 1;
  }
  else
  {
    /* Current memory buffer used is Memory 0 */
    tmp = 0;
  }
  return tmp;
}

uint16_t dma_current_data_counter(DMA_Stream_TypeDef *dma_stream)
{
  /* Return the number of remaining data units for DMAy Streamx */
  return ((uint16_t)(dma_stream->NDTR));
}
```
DMA的寄存器中，表示DMA缓冲通道的为`DMA_SxCR_CT`，取值为0和1，NDTR表示的是DMA缓冲内存中还有多少字节剩余。

DMA的寄存器中，表示DMA缓冲通道的为`DMA_SxCR_CT`，取值为0和1，NDTR表示的是DMA缓冲内存中还有多少字节剩余。

在上面的代码中有这样的一段：
```c
tmp_len = dma_obj->buff_size*2 - dma_obj->read_index;
if (tmp_len != fifo_s_puts(dma_obj->data_fifo, &pdata[dma_obj->read_index], tmp_len))
	fifo_overflow = 1;
else
	fifo_overflow = 0;
dma_obj->read_index = 0;

tmp_len = dma_obj->write_index;
if (tmp_len != fifo_s_puts(dma_obj->data_fifo, &pdata[dma_obj->read_index], tmp_len))
	fifo_overflow = 1;
else
	fifo_overflow = 0;
dma_obj->read_index = dma_obj->write_index;
```
这其中的`fifo_s_puts`函数就是将一个队列转移到另一个队列的操作，它的函数定义如下：
```c
/****************************************
//
//! \brief  Put some elements into FIFO(in single mode).
//!
//! \param  [in]  pfifo is the pointer of valid FIFO.
//! \param  [in]  element is the data element you want to put
//! \param  [in]  the number of elements
//! \retval 0 if operate successfully, otherwise return -1.
//
*****************************************/
int32_t fifo_s_puts(fifo_s_t *pfifo, uint8_t *psource, uint32_t number)
{
  int puts_num = 0;

  if(psource == NULL)
      return -1;

  for(uint32_t i = 0; (i < number) && (pfifo->free > 0); i++)
  {
    pfifo->start_addr[pfifo->write_index++] = psource[i];
    pfifo->write_index %= pfifo->buf_size;
    pfifo->free--;
    pfifo->used++;
    puts_num++;
  }

  return puts_num;
}
```
看到这里，缓冲数据转移基本就梳理清晰了，接下来是这整个工程中**最最最重要**的地方——解析裁判系统的数据！

先从最外层的调用函数开始看：
```c
unpack_fifo_data(&judge_unpack_obj, DN_REG_ID);
```
嘿嘿，执行到这里的时候，`judge_unpack_obj`里面已经有数据啦*（因为前面调用函数`fifo_s_puts`将数据拷贝放进了`judge_rx_obj->data_fifo`中，而`judge_rx_obj`和`judge_unpack_obj`的`data_fifo`是指向同一个队列的）*。

那么这里有一个变量`DN_REG_ID`，它是一个宏定义：
```c
#define DN_REG_ID    0xA5
```
这其实就是裁判系统的FrameHeader帧的SOF起始字节，固定值为0xA5。

好，下面看看这个解析函数的具体实现：
```c
void unpack_fifo_data(unpack_data_t *p_obj, uint8_t sof)
{
  uint8_t byte = 0;

  while ( fifo_used_count(p_obj->data_fifo) )
  {
    byte = fifo_s_get(p_obj->data_fifo);
    switch(p_obj->unpack_step)
    {
      case STEP_HEADER_SOF:
      {
        if(byte == sof)
        {
          p_obj->unpack_step = STEP_LENGTH_LOW;
          p_obj->protocol_packet[p_obj->index++] = byte;
        }
        else
        {
          p_obj->index = 0;
        }
      }break;

      case STEP_LENGTH_LOW:
      {
        p_obj->data_len = byte;
        p_obj->protocol_packet[p_obj->index++] = byte;
        p_obj->unpack_step = STEP_LENGTH_HIGH;
      }break;

      case STEP_LENGTH_HIGH:
      {
        p_obj->data_len |= (byte << 8);
        p_obj->protocol_packet[p_obj->index++] = byte;

        if(p_obj->data_len < (PROTOCAL_FRAME_MAX_SIZE - HEADER_LEN - CRC_LEN))
        {
          p_obj->unpack_step = STEP_FRAME_SEQ;
        }
        else
        {
          p_obj->unpack_step = STEP_HEADER_SOF;
          p_obj->index = 0;
        }
      }break;

      case STEP_FRAME_SEQ:
      {
        p_obj->protocol_packet[p_obj->index++] = byte;
        p_obj->unpack_step = STEP_HEADER_CRC8;
      }break;

      case STEP_HEADER_CRC8:
      {
        p_obj->protocol_packet[p_obj->index++] = byte;

        if (p_obj->index == HEADER_LEN)
        {
          if ( verify_crc8_check_sum(p_obj->protocol_packet, HEADER_LEN) )
          {
            p_obj->unpack_step = STEP_DATA_CRC16;
          }
          else
          {
            p_obj->unpack_step = STEP_HEADER_SOF;
            p_obj->index = 0;
          }
        }
      }break;

      case STEP_DATA_CRC16:
      {
        if (p_obj->index < (HEADER_LEN + CMD_LEN + p_obj->data_len + CRC_LEN))
        {
           p_obj->protocol_packet[p_obj->index++] = byte; 
        }
        if (p_obj->index >= (HEADER_LEN + CMD_LEN + p_obj->data_len + CRC_LEN))
        {
          p_obj->unpack_step = STEP_HEADER_SOF;
          p_obj->index = 0;

          if ( verify_crc16_check_sum(p_obj->protocol_packet, HEADER_LEN + CMD_LEN + p_obj->data_len + CRC_LEN) )
          {

				if (sof == DN_REG_ID)//DN_REG_ID
            {
              judgement_data_handler(p_obj->protocol_packet);
            }
          }
        }
      }break;

      default:
      {
        p_obj->unpack_step = STEP_HEADER_SOF;
        p_obj->index = 0;
      }break;
    }
  }
}
```
又是这么长的函数呀，没事，这已经是最后一关了，而且我已经一眼看见裁判系统的最终最终的解析函数`judgement_data_handler(p_obj->protocol_packet);`。

首先看看函数`fifo_used_count`：
```c
uint32_t fifo_used_count(fifo_s_t* pfifo)
{
  return (pfifo->used);
}
```
这个函数返回的是队列中已经使用的字节数，即存储了多少字节的数据。

接下来的函数是`fifo_s_get`：
```c
uint8_t fifo_s_get(fifo_s_t* pfifo)
{
  uint8_t   retval = 0;

  retval = pfifo->start_addr[pfifo->read_index++];
  pfifo->read_index %= pfifo->buf_size;
  pfifo->free++;
  pfifo->used--;

  return retval;
}
```
显然这个函数不断调用，每次都会将指针往后移，依次把队列中的数据赋值给局部变量`byte`，接下来就简单了，只需要按照裁判系统的通信协议就能理解了。

最后把裁判系统的数据解析函数列出来，就不用写解释了。
```c
void judgement_data_handler(uint8_t *p_frame)
{
  frame_header_t *p_header = (frame_header_t*)p_frame;
  memcpy(p_header, p_frame, HEADER_LEN);

  uint16_t data_length = p_header->data_length;
  uint16_t cmd_id      = *(uint16_t *)(p_frame + HEADER_LEN);
  uint8_t *data_addr   = p_frame + HEADER_LEN + CMD_LEN;

  switch (cmd_id)
  {
    case GAME_INFO_ID:
      memcpy(&judge_rece_mesg.game_information, data_addr, data_length);
    break;

    case REAL_BLOOD_DATA_ID:
      memcpy(&judge_rece_mesg.blood_changed_data, data_addr, data_length);
    break;

    case REAL_SHOOT_DATA_ID:
      memcpy(&judge_rece_mesg.real_shoot_data, data_addr, data_length);
    break;

		case REAL_CHESS_POWER_ID:
      memcpy(&judge_rece_mesg.power_heatdata, data_addr, data_length);
    break;

    case REAL_FIELD_DATA_ID:
      memcpy(&judge_rece_mesg.rfid_data, data_addr, data_length);
    break;

    case GAME_RESULT_ID:
      memcpy(&judge_rece_mesg.game_result_data, data_addr, data_length);
    break;

    case GAIN_BUFF_ID:
      memcpy(&judge_rece_mesg.get_buff_data, data_addr, data_length);
    break;

    case Robo_Postion_ID:
      memcpy(&judge_rece_mesg.gameRobotPos, data_addr, data_length);
    break;
  }
}
```
裁判系统数据的结构体定义如下：
```c
/** 
  * @brief  judgement data command id
  */
typedef enum
{
  GAME_INFO_ID       = 0x0001,  //10Hz
  REAL_BLOOD_DATA_ID = 0x0002,
  REAL_SHOOT_DATA_ID = 0x0003,
	REAL_CHESS_POWER_ID= 0x0004,
  REAL_FIELD_DATA_ID = 0x0005,  //10hZ
  GAME_RESULT_ID     = 0x0006,
  GAIN_BUFF_ID       = 0x0007,
  Robo_Postion_ID			=0X0008,
	
  STU_CUSTOM_DATA_ID = 0x0100,//ÉÏ´«ID

} judge_data_id_e;


/** 
  * @brief  game information structures definition(0x0001)
  *         this package send frequency is 50Hz
  */

typedef __packed struct
{
  uint16_t   stage_remain_time;
  uint8_t    game_process;
  /* current race stage
   0 not start
   1 preparation stage
   2 self-check stage
   3 5 seconds count down
   4 fighting stage
   5 result computing stage */
  uint8_t    robotlevel;
  uint16_t   remain_hp;
  uint16_t   max_hp;  
} game_robot_state_t;

/** 
  * @brief  real time blood volume change data(0x0002)
  */
typedef __packed struct
{
  uint8_t armor_type:4;
 /* 0-3bits: the attacked armor id:
    0x00: 0 front
    0x01:1 left
    0x02:2 behind
    0x03:3 right
    others reserved*/
  uint8_t hurt_type:4;
 /* 4-7bits: blood volume change type
    0x00: armor attacked
    0x01:module offline
    0x02: bullet over speed
    0x03: bullet over frequency */
} robot_hurt_data_t;

/** 
  * @brief  real time shooting data(0x0003)
  */
typedef __packed struct
{
  uint8_t bullet_type;
  uint8_t bullet_freq;
  float   bullet_spd;
} real_shoot_t;
/** 
  * @brief  rfid detect data(0x0004)
  */
typedef __packed struct
{
  float chassisVolt;
	float chassisCurrent;
	float chassisPower;
	float chassisBuffer;
	uint16_t shooterHeat0;
	uint16_t shooterHeat1;
} power_heatdata_t;


/** 
  * @brief  rfid detect data(0x0005)
  */
typedef __packed struct
{
  uint8_t card_type;
  uint8_t card_idx;
} rfid_detect_t;

/** 
  * @brief  game result data(0x0006)
  */
typedef __packed struct
{
  uint8_t winner;
} game_result_t;

/** 
  * @brief  the data of get field buff(0x0007)
  */
typedef __packed struct
{
  uint8_t buff_type;
  uint8_t buff_addition;
} get_buff_t;
/** 
  * @brief  the data of get field buff(0x0008)
  */
typedef __packed struct
{
  float x;
	float y;
	float z;
	float yaw;
} gameRobotPos_t;

/** 
  * @brief  the data structure receive from judgement
  */
typedef struct
{
  game_robot_state_t game_information;	//0x001
  robot_hurt_data_t  blood_changed_data;//0x002
  real_shoot_t       real_shoot_data;		//0x003
	power_heatdata_t 	 power_heatdata;		//0x004
  rfid_detect_t      rfid_data;					//0x005
  game_result_t      game_result_data;	//0x006
  get_buff_t         get_buff_data;			//0x007
	gameRobotPos_t		 gameRobotPos;			//0x008
 
} receive_judge_t;

receive_judge_t judge_rece_mesg;
```

---
哇，真的是兴奋！今天又学到了新知识！