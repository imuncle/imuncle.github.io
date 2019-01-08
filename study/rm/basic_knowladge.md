#写在最前
本网页将我这一年（2018年）的电控经历积累下来的知识和经验，以及下半年进行的两次培训的内容和要点做了一个综合总结。

上半年我一直用的是标准库进行编程，但自从国庆期间用上**HAL库**之后，我被HAL库的便捷深深打动，自此基本放弃了标准库，所以本总结的内容是基于HAL库的，并结合**STM32CubeMX**软件*（因为过程有些繁琐，截图很麻烦，所以本总结并不会贴出STM32CubeMX上的相关配置过程）*。

#GPIO
GPIO外设一共有八种模式，我比较熟悉的是这三种：**上拉输入**、**下拉输入**、**推挽输出**。上拉输入和下拉输入一般都和**外部中断**联系在一起，最典型的的应用就是读取按键的输入。推挽输出的功能是控制IO口的输出电平的高低，最常见的应用就是控制LED灯的亮灭。GPIO涉及的基本函数有以三个：
##GPIO简介
```c
HAL_GPIO_WritePin(GPIO_TypeDef * GPIOx, uint16_t GPIO_Pin, GPIO_PinState PinState);  //直接指定引脚的电平输出，用于推挽输出

HAL_GPIO_TogglePin(GPIO_TypeDef * GPIOx, uint16_t GPIO_Pin);  //直接翻转引脚的电平输出，无需指定输出电平，用于推挽输出

HAL_GPIO_ReadPin(GPIO_TypeDef * GPIOx, uint16_t GPIO_Pin);  //读取指定引脚当前的电平高低
```
函数功能见注释。前两个函数用于推挽输出，第三个函数用于输入功能。GPIO的输入还可以与外部中断联系起来，GPIO的外部中断回调函数如下：
```c
void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin)
{
  
  //用户自己的中断函数逻辑
  //your code here ...
}
```
这里简单说一下回调函数。HAL库的最大特点之一就是有很多的回调函数，几乎所有的中断都有对应的一种或多种回调函数。这些回调函数都被官方提前定义好了，只不过是**__weak**弱定义，我们要实现自己的回调函数逻辑只需要自己重新再定义一次这个回调函数，将它原来的弱定义覆盖即可。
##EXTI
中断的概念大家应该都了解的差不多了，所以我就略过介绍中断这一环节。**外部中断（EXTI）**是STM32众多中断中的一种。STM32一共有16组外部中断，分别对应GPIOx.1~GPIOx.15(x=A,B,C,...,H,I),也就是说序号相同的IO口触发的是同一个外部中断，但是外部中断**无法判断**是由哪个GPIO外设所触发的，所以STM32最多可以监听16个外部中断，且触发这些外部中断的IO口序号**不能相同**。
#USART
STM32中有**UART**与**USART**两种串口通信，USART比UART多出来的**S**代表的是“同步”，也就是说USART既支持同步通信，也支持异步通信，而UART只支持异步通信。但是同步通信在目前阶段的开发中几乎不会接触到，普遍用的还是它的异步通信功能。
##USART简介
USART的标准接线有三根：TX、RX、GND，接线的时候要注意两块单片机的TX和RX要**反接**，因为发送（TX）对应着接收（RX）。个别同学可能图方便不接GND，甚至有些场景只接TX获RX一根线，这种情况虽然也可以通信成功，但是极不稳定，很容易发送失败。

因为USART的发送和接收数据分别使用一根线，所以USART串口通信支持**全双工通信**，即可以同时进行消息的发送和接收。USART的数据接收和发送都有三种方法，分别为**中断**、**DMA**和**非中断非DMA**。我推荐使用DMA接收，尤其是数据量很大的时候。这里列出了DMA方式的接收函数和非中断非DMA方式的发送函数。
```c
HAL_UART_Transmit(UART_HandleTypeDef * huart, uint8_t * pData, uint16_t Size, uint32_t Timeout);  //串口发送函数，指定发送的字节数及其长度，同时指定发送超时时间

/*
 * @brief 串口DMA方式接收，会引发DMA中断。这句一定要在第一次接收中断之前执行一次
 * @param 串口号；接收串口数据的变量；接收的数据大小，接收到这么多字节之后才会引发中断
 * @retval HAL状态HAL_StatusTypeDef，可用于判断接收是否成功
 */
HAL_Receive_DMA(UART_HandleTypeDef * huart, uint8_t * pData, uint16_t Size);
```
USART的发送和接收都可以设置是否触发中断，在标准库中串口通信的发送和接收中断函数是同一个，需要用户自己根据相关的寄存器状态判断是发送还是接收，而HAL库中已经写好了相关判断，并定义好了发送中断回调函数和接收中断回调函数。USART的接收中断回调函数如下：
```c
void HAL_UART_RxCpltCallback(UART_HandleTypeDef * huart)
{
  HAL_Receive_DMA(UART_HandleTypeDef * huart, uint8_t * pData, uint16_t Size);  //继续使能串口接收中断
  
  //用户自己的中断函数逻辑
  //your code here ...
}
```
大家可以注意一下这个中断回调函数的命名方式，其实很好记忆：

|    HAL|       UART |      Rx |Cplt|Callback|
|:-------:|:-------------:|:----------:|:----:|:-----:|
|   HAL库  |串口|接收|Complete简写，接收完成|回调函数|
大家如果看过HAL库的手册或者粗粗翻看过HAL库的头文件的话，会发现HAL库的回调函数特别丰富，不仅有完成回调函数，还有完成一半的回调函数，还有阻塞状态的回调函数等等，有兴趣的朋友可以自己去探索。
##printf
另外这里介绍一下怎么在STM32中使用C语言中大名鼎鼎的printf函数。printf函数属于C语言自带的函数，需要在keil中勾选**Use MicroLIB**选项*（怎么勾选？百度一下，你就知道）*。然后在代码中的任何一个位置加入下面一段代码：
```c
#pragma import(__use_no_semihosting)
//标准库需要的支持函数
struct __FILE
{
	int handle;
};
FILE __stdout;
//定义_sys_exit()以避免使用半主机模式
void _sys_exit(int x)
{
	x = x;
}
//重定义 fputc 函数
int fputc(int ch, FILE *f)
{
	while((USART1->SR&0X40)==0);//循环发送,直到发送完毕
	USART1->DR = (u8) ch;
	return ch;
}
```
上面的fputc函数是被printf函数调用的函数之一，只需要重定义它即可实现将printf的内容通过串口发送出去。
#TIM
TIM分为**高级定时器**、**通用定时器**和**基本定时器**，其中基本定时器*（一般为TIM6和TIM7）*的功能最简单，只有定时的功能，一般用作时钟基源*（比如**FreeRTOS操作系统**的时钟基源）*；通用定时器在基本的定时功能的基础上多出了**输出比较**和**输入捕获**功能，输出比较可以输出周期性的方波*（比如**PWM**波和**PPM**波）*，输入捕获可以读取输入信号的高电平和低电平的时间，进而可以计算出信号的周期和占空比，这两者都应用十分广泛；高级定时器除了上述功能之外，还有还包含一些与电机控制和数字电源应用相关的功能，比方带死区控制的互补信号输出、紧急刹车关断输入控制等，这些功能可以用于控制高级的工业应用当中。

在我们的日常开发中只需要掌握通用定时器的定时、输出比较、和输入捕获功能就足够了。
##定时功能
TIM最简单的功能就是定时功能，它对应的有一个中断函数，可以实现定时执行某个操作。TIM定时器要使用之前需要初始化，主要注意两个寄存器的值，一个是**预分频**寄存器的值，一个是**ARR**寄存器的值，这两个寄存器决定了定时器的计数周期，也就是定时器中断发生的频率。

这里要注意的是TIM定时器的定时属于硬件定时，是不允许超时的*（事实上不论是什么定时器都不建议超时）*，如果超时就会卡死程序。TIM定时器使用前要打开定时器，函数如下：
```c
HAL_TIM_Base_Start_IT(TIM_HandleTypeDef * htim);  //定时器中断使能函数
```
对应的定时器中断回调函数为：
```c
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef * htim)
{  
  //用户自己的中断函数逻辑
  //your code here ...
}
```
##PWM
定时器的一个重要应用就是产生**PWM波**。PWM波的应用非常广泛，无论是舵机，还是蜂鸣器，还是航模电调，都是使用PWM驱动。PWM波有两个参数，一个是周期，一个是占空比，它们分别对应TIM的ARR寄存器和CCRx*（x是定时器的通道号）*寄存器。如果再程序中途想改变PWM波的占空比，需要直接操作寄存器，因为HAL库并没有相关函数。
```c
TIM1->CCR1 = 1000;			//将TIM1的通道1对应的CCR1寄存器赋值为1000
```
这里可以给大家介绍一下**影子寄存器**的概念。我们用户所操作的所有寄存器，都不是真正起作用的寄存器，真正起作用的寄存器是影子寄存器。我们所操作的寄存器叫**预装载寄存器**，影子寄存器的值会随着预装载寄存器的改变而改变，但**不是立即改变**，其修改值只能通过更新事件才能生效。因为在定时器计数的过程中影子寄存器的值直接改变可能会引发错误。

使用定时器的PWM波功能也需要一个开启定时器的操作，函数如下：
```c
HAL_TIM_PWM_Start(TIM_HandleTypeDef * htim, uint32_t Channel);  //PWM波产生使能函数
```
PWM波一般不会用到中断函数。
##PWM_Read
我们一般都是产生PWM波去控制外设，但大家可以换个角度想一想，如果让我们自己来开发一个舵机呢，我们就需要读取输入的PWM波的占空比和周期，最笨的方法就是在死循环里面不断地扫面IO的电平，当电平变化的时候开始利用延时函数计时，这种方法效率不高且精度很低。另一种方法就是使用定时器的输入捕获功能。

定时器的输入捕获有三种模式：**上升沿捕获**、**下降沿捕获**和**上升下降沿捕获** *（有没有感觉非常像GPIO外部中断的触发方式？）*，这三种状态所对应的中断触发条件不一样。显然，如果我们要检测PWM波的高电平，则初始要设置为上升沿触发，触发之后改为下降沿触发。

那么怎么计时呢？定时器内部有一个不断在计数的寄存器CNT，计数方式又大体上分为**向上计数**、**向下计数**和**中间计数**。拿向上计数举例，CNT从0按预分频后的频率计数到ARR的值之后自动重载为0，然后继续计数。在输入捕获模式下，CNT的值会被赋值给CCRx，所以我们只需要在每次触发中断之后**将CNT清零**，然后在下一次中断里面获取CCRx的值，再结合定时器的频率就可以计算出对应的时间。

同上，使用输入捕获功能需要一个开启操作：
```c
//在软件里面已经设置好了为上升沿触发模式
HAL_TIM_IC_Start_IT(&htim4, TIM_CHANNEL_1);    //这里是打开了TIM4通道1的输入捕获功能
```
相对应的输入捕获的中断回调函数为：
```c
void HAL_TIM_IC_CaptureCallback(TIM_HandleTypeDef *htim)
{
	//用户自己的中断函数逻辑
	//your code here...
}
```
这里给出一份读取PWM波高电平和低电平时间的代码：
```c
/*
 * 使用的是TIM4的通道1作为输入捕获口
 * 预分频后定时器频率为1MHz，即计数周期为1微秒1次
 */

uint32_t pwm_high_level_time;    //PWM波高电平的时间
uint32_t pwm_low_level_time;     //PWM波低电平的时间
int tim_mode_raise_or_falling = 0;//0代表上升，1代表下降

void HAL_TIM_IC_CaptureCallback(TIM_HandleTypeDef *htim)
{
  if(tim_mode_raise_or_falling == 0)			//如果是上升沿触发
  {
    pwm_low_level_time = HAL_TIM_ReadCapturedValue(&htim4,TIM_CHANNEL_1) + 1;		//记录低电平的时间（第一次触发该数值无效）
    __HAL_TIM_SET_COUNTER(&htim4,0);		//清零定时器计数CNT
    TIM_RESET_CAPTUREPOLARITY(&htim4, TIM_CHANNEL_1);		//重置定时器配置
    TIM_SET_CAPTUREPOLARITY(&htim4,TIM_CHANNEL_1,TIM_ICPOLARITY_FALLING);		//配置定时器为下降沿触发模式
    tim_mode_raise_or_falling = 1;		//中断模式标志位改变
  }
  else if(tim_mode_raise_or_falling == 1)			//如果是下降沿触发
  {
    pwm_high_level_time = HAL_TIM_ReadCapturedValue(&htim4,TIM_CHANNEL_1) + 1;		//记录高电平的时间
    __HAL_TIM_SET_COUNTER(&htim4,0);		//清零定时器计数CNT
    TIM_RESET_CAPTUREPOLARITY(&htim4, TIM_CHANNEL_1);		//重置定时器配置
    TIM_SET_CAPTUREPOLARITY(&htim4,TIM_CHANNEL_1,TIM_ICPOLARITY_RISING);		//配置定时器为上升沿触发模式
    tim_mode_raise_or_falling = 0;		//中断模式标志位改变
  }
}
```
细心的同学可能会发现，在记录时间的那条语句的最后有一个`+1`的操作，这里我引用一段我看到过的描述来解释这一现象（原文见[https://wenku.baidu.com/view/dcd8f0f67f1922791688e8f6.html](https://wenku.baidu.com/view/dcd8f0f67f1922791688e8f6.html) ）：
> PWM模式：
> PWM边沿对齐PWM1模式，向上计数时，CCRx正确取值范围为（0~ARR）：
> CCRx = 0时，产生全无效电平（产生占空比为0%的PWM波形）
> CCRx <= ARR时，产生CCRx个有效电平(产生占空比为 CCRx/(ARR+1)*100% 的PWM波形)。
> CCRx > ARR时，产生全有效电平。
> PWM边沿对齐PWM1模式，向下计数时，CCRx正确取值范围为(0~ARR)：
> CCRx = 0时，不能产生占空比 0% 的PWM波形(产生占空比为1/(ARR+1)*100%的PWM波形)。
> CCRx <= ARR时，产生CCRx+1个有效电平(产生占空比为 (CCRx+1)/(ARR+1)*100% 的PWM波形)。
> CCRx > ARR时，产生全有效电平。
> 
> 捕获脉冲：
> 自动复位计数器方式下的PWM输入信号测量
> 在该模式下，可以方便地测试输入信号的周期(频率/转速)和占空比。
> TIMx_CCR1的 寄存器值+1 就是周期计数值，TIMx_CCR2的 寄存器值+1 就是高电平计数值。
> 占空比=(TIMx_CCR2+1)/(TIMx_CCR1+1)*100%

从上面也可以看出，我们配置定时器的ARR的值的时候要减一个1，比方说我们想要周期为20000，那么ARR的值应该赋值为19999，因为CNT的数值是从0~19999，一共20000次计数。
#ADC
STM32F1 系列芯片共两个**ADC**模块，每个**ADC**模块有9个通道，共18个通道。**ADC**的工作模式有**单次模式**、**连续模式**、**扫描模式**和**间断模式**。本次培训主要讲解了连续模式的使用，并在**DMA**模式下读取数据。

ADC使用DMA时要注意选择**Circular**模式。另外ADC的读取到的有效数字是后十二位，对应的电压范围是0~3.3V，在中断函数中需要计算。涉及到的函数如下:
```c
HAL_ADC_Start_DMA(ADC_HandleTypeDef * hadc, uint32_t * pData, uint32_t Length);  //开启使能ADC功能
```
大家可以发现，凡是HAL用于接收数据的函数基本都是这三个形参，调用的方法也是一样的套路，只是形参的数据类型可能不同。ADC的中断回调函数如下：
```c
void HAL_ADC_ConvCpltCallback(ADC_HandleTypeDef * hadc)
{  
  your code here ...
  //用户自己的中断函数逻辑
}
```
这个函数的名字也很好记，*Conv*代表*Convert*，转换的意思，也即ADC采集的数据转换完成之后的回调函数。

ADC我用的不是很多，所以懂得也不是很多，暂时就写这么多。
#IIC
IIC是由Philip半导体公司发明的，用途广泛，很多外设都会使用到IIC通信。IIC通信只需要使用4根线，分别是**VCC**、**GND**、**CLK**和**SDA**。IIC总线上可以挂载多个设备，并分为**主机**和**从机**，最多支持两个主机。每个设备都有唯一的地址，CLK线负责同步各个设备的时序，SDA负责传输数据，显然在IIC总线上同时只能存在一组通信，类似半双工通信。

通信的信号分为**起始信号**、**数据信号**、**应答信号**和**结束信号**，主机在发送数据之前要先发送起始信号，发送结束之后要发送结束信号，从机每收到一个字节后会反馈一个应答信号，防止数据传输出错。

STM32F1 系列芯片共两个**IIC**模块，IIC开发最重要的东西就是**时序图**，只要看懂了时序图一切都显得极为简单。

IIC 的使用分为**使用IO口模拟时序**和**直接使用硬件寄存器**两种方式实现IIC通信。虽然ARM公司为了避免Philip公司的IIC专利，将STM32里的IIC设计得很复杂，而且百度上一般都是使用IO口模拟时序，但是HAL库毕竟是那些设计硬件的工程师编写的，使用起来简直不要太方便，所以这里讲解使用STM32硬件自带的IIC模块的实现方式。

使用硬件IIC之后我们就不需要去理会那些时序图了，只需要注意需要发送的信息和从机的地址就行了。一般来说，IIC的外设的信号都分为两种，一种是命令，一种是数据。就拿OLED屏幕来说，移动光标的信息属于命令，显示的内容就属于数据。这方面的具体需求就要参考卖家提供的说明书或者示例代码了。

不管是发送命令还是发送数据，都会使用这个函数:
```c
HAL_I2C_Mem_Write(I2C_HandleTypeDef * hi2c, uint16_t DevAddress, uint16_t MemAddress, uint16_t MemAddSize, uint8_t * pData, uint16_t Size, uint32_t Timeout);  //将数据写入指定地址的从机
```
IIC我没有使用过相关的中断函数，IIC的中断无非也是数据发送一半中断回调、发送完成中断回调这么几种，与其他传输或接受数据的外设的套路都是一样的。
#WWDG
STM32 分为**独立看门狗**和**窗口看门狗**，其中独立看门狗时钟源独立，用于监控硬件异常，窗口看门狗时钟源不独立，用于监控软件异常，常用的是窗口看门狗。

窗口看门狗（ Window Watch Dog Timer ）的初始化与其他定时器的初始化有些许不同，需要的寄存器包括**预分频寄存器**，**窗口配置寄存器**和**递减计数寄存器**的重装载值。预分频就不说了，前面已经讲过了，窗口配置寄存器不能大于递减计数寄存器的值，它决定了为否操作的时间下限，当递减计数器大于窗口配置寄存器的值的时候，喂狗无效。递减计数器的递减到0x40（下窗口值）后自动重载，并将单片机复位。所以只有在递减计数器的值在0x40和窗口配置寄存器的值之间的时候，喂狗操作才有效，这就是喂狗时间的上限和下限，喂狗太频繁则无效，喂狗太慢则程序被复位。

WWDG涉及到的函数只有喂狗的函数：
```c
HAL_WWDG_Refresh(WWDG_HandleTypeDef * hwwdg);  //重载窗口看门狗递减计数器（喂狗）
```
WWDG一般都不会用到它的中断函数，所以我也没用过。
#FreeRTOS
在嵌入式领域中，嵌入式实时操作系统正得到越来越广泛的应用。采用嵌入式实时操作系统(RTOS)可以更合理、更有效地利用CPU的资源，简化应用软件的设计，缩短系统开发时间，更好地保证系统的实时性和可靠性。嵌入式操作系统有好几种，比如μC/OS-II、embOS、salvo、RTX，还有这里要说的FreeRTOS。

FreeRTOS是一个迷你的实时操作系统内核。作为一个轻量级的操作系统，功能包括：任务管理、时间管理、信号量、消息队列、内存管理、记录功能、软件定时器、协程等，可基本满足较小系统的需要。

我接触FreeRTOS时间不是很长，也没怎么去深入研究开发它的功能和用法，这里我使用的是由ST公司封装的**CMSIS-RTOS API**，这个API支持多种操作系统，而且使用方便。以下内容是从这篇[讲解FreeRTOS的博客](http://www.cnblogs.com/horal/p/7841148.html)里面摘取的，但是这篇博客里面的一些函数的用法已经不适用于最新版本的库，望读者注意。

##线程
操作系统与裸机的最大区别就是线程。在裸机系统中，除了while循环外，我们要在其他地方尽量避免死循环的存在，而在操作系统中，每一个线程都是一个死循环，FreeRTOS有一个强大的任务调度器，可以快速地切换各个任务并保存相应的上下文。

进程实例：
```c
/* USER CODE BEGIN Header_StartDefaultTask */
/**
  * @brief  Function implementing the defaultTask thread.
  * @param  argument: Not used 
  * @retval None
  */
/* USER CODE END Header_StartDefaultTask */
void StartDefaultTask(void const * argument)
{

  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  for(;;)
  {
    
		osDelay(1);
  }
  /* USER CODE END StartDefaultTask */
}
```
线程与函数的最大区别在于，函数总归要返回到被调用处，而进程则是无限循环，不会主动结束。

在FreeRTOS里面，线程有八个优先级：

|CMSIS-RTOS Priority Levels |
|:-------|
|   osPriorityIdle  |
| osPriorityLow|
| osPriorityBelowNormal|
| osPriorityNormal|
| osPriorityAboveNormal|
| osPriorityHigh|
| osPriorityRealTime|
| osPriorityError|
上述优先级的从上到下依次增加*（其实从命名就能看出来）*，不同于裸机的定时器，在操作系统中线程的优先级可以是一样的，当两个线程的优先级是一样时，任务调度器会不断在这两个线程间来回切换，相当于两个线程同步执行，而且不用担心线程里面语句过多导致“超时”的情况。操作系统的优越性可见一斑。

线程的定义和初始化均可以在STM32CubeMX中完成。线程的使用流程如下：
```c
osThreadId defaultTaskHandle;			//定义线程的ID，用于对线程的各种操作，比如修改优先级，中止、开始线程等
void StartDefaultTask(void const * argument);		//线程对应的函数体的声明
osThreadDef(defaultTask, StartDefaultTask, osPriorityNormal, 0, 128);		//线程定义，参数分别为：线程的名称，线程函数体，线程优先级，线程实例化个数，线程分配的栈空间
defaultTaskHandle = osThreadCreate(osThread(defaultTask), NULL);		//创建线程，并赋值给对应的线程ID

/* 线程的具体实现 */
void StartDefaultTask(void const * argument)
{

  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  for(;;)
  {
    	//这里写用户逻辑
		osDelay(1);
  }
  /* USER CODE END StartDefaultTask */
}
```
上面代码是我直接复制的，也就是说用软件配置生成好代码之后，线程的声明，定义，创建都已经完成，我们只需要在线程的函数体里面实现自己的逻辑就行了，可以说是非常方便。
##信号量
光有线程有时候还不够，因为项目开发中线程往往不是相互独立的，需要不同的线程之间进行通信。在FreeRTOS中线程的通信可以使用信号量、队列、邮箱进行通信，这里只讲解最简单的信号量的使用，其他两种的使用可以参考[这篇博客](http://www.cnblogs.com/horal/p/7841148.html)。

信号量可以实现一个线程在另一个线程完成后再进行，也可以实现两个线程真正同步运行，线程可以发出一个信号量，也可以等待一个信号量。想象这样一个场景，线程B的运行需要线程A的预先执行，也就是线程B必须在线程A执行过后才能执行，怎么办呢？我们可以在线程A的函数最后发送一个信号量，然后在线程B的最前面等待该信号量。当线程B没有等待到信号量的时候，该线程处于**挂起**状态，直到信号量的到达才转为准备状态。

上述的流程的实现过程如下：
```c
osSemaphoreId RemoteSignalHandle;		//定义信号量的ID
osSemaphoreDef(RemoteSignal);		//定义一个信号量，并命名为RemoteSignal
RemoteSignalHandle = osSemaphoreCreate(osSemaphore(RemoteSignal), 1);	//创建一个信号量实例，并赋值给对应的ID

/* 这里是一个线程，相关的线程定义步骤此处省略 */
void RCReceive(void const * argument)
{
  /* Infinite loop */
  for(;;)
  {
    osSemaphoreWait(RemoteSignalHandle, osWaitForever);		//等待信号量，等待时间为“永远”
	Remote.receiveData(&Remote, rc_data);	//等待到信号量之后执行的语句
  }
  /* USER CODE END RCReceive */
}

/*
 * 此示例代码使用中断函数发送信号量
 * 这样的好处是将复杂的数据处理逻辑放在线程中，尽量减少中断里面的函数执行时间
 */
void HAL_UART_RxCpltCallback (UART_HandleTypeDef *huart)
{
	HAL_UART_Receive_DMA(&huart1, rc_data, 18u);		//再次使能串口接收
	if(huart == &huart1)		//判断是否是由USART1触发的中断
	{
		osSemaphoreRelease(RemoteSignalHandle);		//发送信号量
	}
}
```

下面的代码可以实现两个线程同步进行：
```c
/* 线程1 */
void Thead1(void const * argument)
{
	for(;;)
	{
		osSemaphoreRelease(Thead2_start);		//发送让线程2开始的信号量
		osSemaphoreWait(Thead1_start, osWaitForever);		//等待线程2开始后发出的让线程1开始的信号量
		Thead1_function();		//等待到线程2发送的信号量（即线程2开始执行后，执行线程1的逻辑，此时线程2的逻辑也同步开始）
	}
}

/* 线程2 */
void Thead2(void const * argument)
{
	for(;;)
	{
		osSemaphoreWait(Thead2_start, osWaitForever);		//等待线程1的信号量
		osSemaphoreRelease(Thead1_start);		//发送让线程1开始的信号量
		Thead2_function();		//线程2的具体逻辑
	}
}
```
##延时函数
CMSIS-RTOS有自己的延时函数。大家应该还记得HAL的延时函数是`HAL_Delay(uint32_t time)`，该延时函数是基于**系统滴答定时器Systick**实现的，但是该定时器的中断优先级很低，甚至低于操作系统的优先级，所以在线程使用该延时函数会出问题。

相信细心的朋友已经发现了，就在前面的代码中，有一个函数我没有讲过，没错，就是`osDelay(uint32_t time)`函数，这个函数能在线程中实现微秒级的延时。

在讲解该延时函数的作用之前，先来看看操作系统的任务调度器是怎么调度任务的。在FreeRTOS中，每一个线程都有四种状态：**挂起**、**阻塞**、**就绪**和**运行**状态，每一种状态的特点从它的命名就可以猜出来。任务调度器在每一次切换任务的时候都会检查有没有优先级更高的线程处于就绪（ready）状态，如果有，则暂停当前执行的线程，转而执行优先级更高的线程。另外在FreeRTOS中，默认有一个空闲线程，它的优先级是最低的（osPriorityIdle），它是在没有任何一个用户的线程处于就绪或运行状态的时候运行。

在程序执行到`osDelay(uint32_t time);`这条语句后，当前任务被挂起，任务调度器转而判断其他哪个线程得以执行，当时间到了之后线程变为就绪状态，等待任务调度器调用，被执行的线程为运行状态。

##虚拟定时器
虚拟定时器的功能相当于基本定时器，能实现最基本的定时执行一个回调函数，是通过软件实现的，所以叫做虚拟定时器，能实现毫秒级的定时执行。

虚拟定时器的使用方法如下：
```c
osTimerId superviseTimerHandle;		//定义虚拟定时器的ID
osTimerDef(superviseTimer, supervise);		//定义一个虚拟定时器，指定了定时器的回调函数是supervise()
superviseTimerHandle = osTimerCreate(osTimer(superviseTimer), osTimerPeriodic, NULL);		//创建一个虚拟定时器实例，并指定了定时器模式为osTimerPeriodic模式（连续模式，还有一种模式是只执行一次的osTimerOnce）
osTimerStart(superviseTimerHandle, 2);		//启动虚拟定时器，配置定时器2毫秒执行一次

/* 虚拟定时器的回调函数 */
void supervise(void const * argument)
{
  /* USER CODE BEGIN supervise */
  //your code here...
  /* USER CODE END supervise */
}
```
要注意的是，虚拟定时器的回调函数和线程不一样，它不能有死循环，如果使用死循环当然没法实现定时执行啦。

从上面的讲解中大家可以发现，CMSIS-RTOS的API调用格式也都差不多，多练几次就行，很容易掌握的。
#CAN
**CAN**是控制器局域网络(Controller Area Network, CAN)的简称，是由以研发和生产汽车电子产品著称的德国BOSCH公司开发的，并最终成为国际标准，是国际上应用最广泛的现场总线之一。

CAN的设计初衷是为适应“减少线束的数量”、“通过多个LAN，进行大量数据的高速通信”的需要，所以CAN通信只需要两根线：CANH和CANL，不需要VCC或GND，设备通过改变CANH和CANL之间的电位差也实现逻辑0和逻辑1的传输。
##硬件要求
CAN通信需要硬件上配备一个专门的CAN收发器，还需要在总线两端各加入一个120Ω的电阻。这里提一下，经过本人的多次测试，虽然只有一个设备不能构成CAN总线，但是CAN外设的初始化也是可以顺利实现的，如果程序卡在了CAN的初始化处，那么80%是硬件层面出了问题，或者是引脚选错了。
##CAN总线
理论上，CAN总线上可以挂载无数个设备，但因为CAN总线只有两根线，同时只能传输一份数据，也就是只能半双工通信，设备数量多了之后传输效率就降低了，而且CAN总线的传输频率与传输距离成反比。目前CAN总线最高可支持1M的传输速率，汽车上使用的比较多的有500K和250K的高速CAN，与125K和62.5K的低速CAN。

CAN总线上的每一个设备都有唯一的ID号，类似IIC的地址，但与IIC不同的是，CAN总线上没有主机和从机之分，每个设备都可以做主机，也都可以做从机。

CAN只有两根线，简陋的硬件设备必然对应了复杂的通信协议以保证数据的完整传输。这里引用百度百科的解释：
> CAN数据帧由远程帧、错误帧和超载帧组成。
远程帧由6个场组成：帧起始、仲裁场、控制场、CRC场、应答场和帧结束。
错误帧由两个不同场组成，第一个场由来自各站的错误标志叠加得到，第二个场是错误界定符。
超载帧包括两个位场：超载标志和超载界定符。

更多具体的通信协议就不写出来了，反正这些都由CAN收发器实现了，我们用户只需要享受它带来的便捷就完事了。

CAN的初始化需要配置好CAN的总线传输速率，并配置CAN的过滤器。因为CAN通信是携带ID号的，总线上的每一个设备都会收到信息，设备根据信息里面带的ID号来判断是不是发给自己的信息，如果不是就忽略，这就是一个过滤的过程，用户配置过滤器可以实现接收某个或某些外设的消息，而忽略其他消息。

##过滤器
CAN的过滤器无法在软件里面配置，需要手动写函数，这里贴出一个接收所有消息的过滤器配置函数~~（其实自己不太会）~~：
```c
/**
* @brief CAN外设过滤器初始化
* @param can结构体
* @retval None
*/
HAL_StatusTypeDef CanFilterInit(CAN_HandleTypeDef* hcan)
{
  CAN_FilterTypeDef  sFilterConfig;

  sFilterConfig.FilterBank = 0;
  sFilterConfig.FilterMode = CAN_FILTERMODE_IDMASK;
  sFilterConfig.FilterScale = CAN_FILTERSCALE_32BIT;
  sFilterConfig.FilterIdHigh = 0x0000;
  sFilterConfig.FilterIdLow = 0x0000;
  sFilterConfig.FilterMaskIdHigh = 0x0000;
  sFilterConfig.FilterMaskIdLow = 0x0000;
  sFilterConfig.FilterFIFOAssignment = CAN_RX_FIFO0;
  sFilterConfig.FilterActivation = ENABLE;
  sFilterConfig.SlaveStartFilterBank = 14;
  
	if(hcan == &hcan1)
	{
		sFilterConfig.FilterBank = 0;
	}
	if(hcan == &hcan2)
	{
		sFilterConfig.FilterBank = 14;
	}
	
  if(HAL_CAN_ConfigFilter(hcan, &sFilterConfig) != HAL_OK)
  {
    Error_Handler();
  }

  if (HAL_CAN_Start(hcan) != HAL_OK)		//开启CAN
  {
    Error_Handler();
  }
	
  if (HAL_CAN_ActivateNotification(hcan, CAN_IT_RX_FIFO0_MSG_PENDING) != HAL_OK)
  {
    Error_Handler();
  }

	return HAL_OK;
}
```
##使用步骤
CAN通信有两个邮箱用于发送和接收，每个邮箱对应一个中断回调函数，一般都选择邮箱0，下面列出CAN的使用步骤：
```c
CanFilterInit(&hcan1);          //初始化CAN1过滤器

/**
 * @brief CAN通信接收中断回调函数
 * @param CAN序号
 * @retval None
 */
void HAL_CAN_RxFifo0MsgPendingCallback(CAN_HandleTypeDef *hcan)
{
	CAN_RxHeaderTypeDef   RxHeader;
	if(HAL_CAN_GetRxMessage(hcan, CAN_RX_FIFO0, &RxHeader, CanReceiveData) != HAL_OK)
  {
    Error_Handler();            //如果CAN通信数据接收出错，则进入死循环
  }
  CanDataReceive(RxHeader.StdId);   //进行电机数据解析
}
```
从代码中可以看出，初始化完成之后，只需要调用CAN的过滤器初始化函数即可使用CAN通信了。上面列出的是RX0对应的CAN接收中断函数`HAL_CAN_RxFifo0MsgPendingCallback(CAN_HandleTypeDef *hcan)`。

CAN通信的发送函数如下*（此处以大疆的电机通信协议为例）*：
```c
/**
* @brief ID为1~4的电机信号发送函数
* @param ID为1~4的各个电机的电流数值
* @retval None
*/
void CanTransmit_1234(CAN_HandleTypeDef *hcanx, int16_t cm1_iq, int16_t cm2_iq, int16_t cm3_iq, int16_t cm4_iq)
{
  CAN_TxHeaderTypeDef TxMessage;
	
	TxMessage.DLC=0x08;
  TxMessage.StdId=0x200;
  TxMessage.IDE=CAN_ID_STD;
  TxMessage.RTR=CAN_RTR_DATA;
  uint8_t TxData[8];
	
	TxData[0] = (uint8_t)(cm1_iq >> 8);
	TxData[1] = (uint8_t)cm1_iq;
	TxData[2] = (uint8_t)(cm2_iq >> 8);
	TxData[3] = (uint8_t)cm2_iq;
	TxData[4] = (uint8_t)(cm3_iq >> 8);
	TxData[5] = (uint8_t)cm3_iq;
	TxData[6] = (uint8_t)(cm4_iq >> 8);
	TxData[7] = (uint8_t)cm4_iq; 

	if(HAL_CAN_AddTxMessage(hcanx,&TxMessage,TxData,(uint32_t*)CAN_TX_MAILBOX0)!=HAL_OK)
	{
		 Error_Handler();       //如果CAN信息发送失败则进入死循环
	}
}
```
CAN通信真要理解清楚其实不容易，但是只学习怎么使用它的话，那是真的方便，用上就不想换了。