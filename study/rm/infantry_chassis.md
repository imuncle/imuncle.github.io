#步兵车底盘驱动
底盘作为一个机器人最基础的东西，是各位必须掌握的。但是看着大家的任务完成进度感到焦心，所以写了这篇步兵车底盘驱动代码的详解，以及底盘调试的步骤和要点。
#工程简介
- 这篇教程里的代码使用STM32F405RGT6芯片，使用STM32CubeMX软件辅助进行开发。
- 使用的电机是由大疆创新生产的3508无刷电机，搭配C620电子调速器，使用CAN通信进行控制。
- 使用的遥控器是DT7 Robomaster比赛专用遥控器，遥控器接收机为DR16。
- 底盘采用麦克纳姆轮全向底盘，麦克纳姆轮为“O-长方形”型安装方式，四个电机的ID号位置分布如下（底盘正前方朝上）：
```
左上 1	2 右上
左下 4	3 右下
```

关于麦克纳姆轮的介绍可以查看这个视频的讲解，浅显易懂。

<center><iframe src="//player.bilibili.com/player.html?aid=17229132&cid=28155837&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe></center>

麦克纳姆轮的运动解析计算可以参考这篇博客[【学渣的自我修养】麦克纳姆轮浅谈](https://zhuanlan.zhihu.com/p/20282234)，其实麦克纳姆轮底盘就是一个简单的运动合成，可以参考下面的代码进行理解。

#遥控器通信协议
遥控器采用的是DBUS协议，需要搭配硬件对应的取反电路才能正常使用。单片机通过与接收机的串口通信获取遥控器数据。遥控器每14ms发送一个18字节的数据，在遥控器的说明书中可以看到相关的数据解析函数：
```c
Typedef __packed struct
{
	struct
	{
		uint16_t ch0;
		uint16_t ch1;
		uint16_t ch2;
		uint16_t ch3;
		uint8_t s1;
		uint8_t s2;
	}rc;
	struct
	{
		int16_t x;
		int16_t y;
		int16_t z;
		uint8_t press_l;
		uint8_t press_r;
	}mouse;
	struct
	{
		uint16_t v;
	}key;
}RC_Ctl_t;

void RemoteDataProcess(uint8_t *pData)
{
	if(pData == NULL)
	{
		return;
	}

	RC_CtrlData.rc.ch0 = ((int16_t)pData[0] | ((int16_t)pData[1] << 8)) & 0x07FF;
	RC_CtrlData.rc.ch1 = (((int16_t)pData[1] >> 3) | ((int16_t)pData[2] << 5))
	& 0x07FF;
	RC_CtrlData.rc.ch2 = (((int16_t)pData[2] >> 6) | ((int16_t)pData[3] << 2) |
	((int16_t)pData[4] << 10)) & 0x07FF;
	RC_CtrlData.rc.ch3 = (((int16_t)pData[4] >> 1) | ((int16_t)pData[5]<<7)) &
	0x07FF;

	RC_CtrlData.rc.s1 = ((pData[5] >> 4) & 0x000C) >> 2;
	RC_CtrlData.rc.s2 = ((pData[5] >> 4) & 0x0003);
	RC_CtrlData.mouse.x = ((int16_t)pData[6]) | ((int16_t)pData[7] << 8);
	RC_CtrlData.mouse.y = ((int16_t)pData[8]) | ((int16_t)pData[9] << 8);
	RC_CtrlData.mouse.z = ((int16_t)pData[10]) | ((int16_t)pData[11] << 8);
	RC_CtrlData.mouse.press_l = pData[12];
	RC_CtrlData.mouse.press_r = pData[13];
	RC_CtrlData.key.v = ((int16_t)pData[14]) | ((int16_t)pData[15] << 8);
	//your control code ….
}
```
上述的数据解析函数有点复杂，全是各种移位与或操作，对解码过程感兴趣的可以查看这篇文章[RM2016DBUS协议完全解析](https://wenku.baidu.com/view/8afff2fb763231126fdb1120.html)。
#电机通信协议
首先要明白，我们是通过CAN通信发送信息给电调，然后由电调自己控制电机转动的。
从C620的说明书中可以找到它的通信协议，分为发送数据的通信协议以及反馈信息的通信协议。
##发送数据
对于ID号为1~4号的电机，通信协议如下：

| 标识符 | 帧格式 | 帧类型 | DLC |
|:---:|:---:|:---:|:---:|
|0x200 | DATA | 标准帧 | 8字节 |

数据域|内容|电调ID
:---:|:---:|:---:
DATA[0]|控制电流值高8位|1
DATA[1]|控制电流值低8位
DATA[2]|控制电流值高8位|2
DATA[3]|控制电流值低8位
DATA[4]|控制电流值高8位|3
DATA[5]|控制电流值低8位
DATA[6]|控制电流值高8位|4
DATA[7]|控制电流值低8位

对于ID号为5~8的电机，通信协议如下：

| 标识符 | 帧格式 | 帧类型 | DLC |
|:---:|:---:|:---:|:---:|
|0x1FF | DATA | 标准帧 | 8字节 |

数据域|内容|电调ID
:---:|:---:|:---:
DATA[0]|控制电流值高8位|1
DATA[1]|控制电流值低8位
DATA[2]|控制电流值高8位|2
DATA[3]|控制电流值低8位
DATA[4]|控制电流值高8位|3
DATA[5]|控制电流值低8位
DATA[6]|控制电流值高8位|4
DATA[7]|控制电流值低8位

控制电流值范围为-16384~0~16384，对应电调输出的转矩电流范围为-20~0~20A。
##电调反馈报文格式

标识符|0x200+电调ID号
:--:|:--:
|如ID为1，则标识符为201
帧类型|标准帧
帧格式|DATA
DLC|8字节

数据域|内容
:--:|:--:
DATA[0]|转子机械角度高8位
DATA[1]|转子机械角度低8位
DATA[2]|转子转速高8位
DATA[3]|转子转速低8位
DATA[4]|实际转矩电流高8位
DATA[5]|实际转矩电流低8位
DATA[6]|电机温度
DATA[7]|Null

发送频率|1KHz
:--:|:--:
转子机械角度值范围|0~8191（对应转子机械角度0~360°）
转子转速单位|RPM
电机温度单位|℃

#遥控器数据接收
遥控器数据是通过串口通信接收的，根据遥控器说明书，要设置串口波特率为100K。遥控器数据接收相关语句如下：
```c
struct Remote
{
	int16_t ch0;
	int16_t ch1;
	int16_t ch2;
	int16_t ch3;
	int8_t s1;
	int8_t s2;
};

struct Mouse
{
	int16_t x;
	int16_t y;
	int16_t z;
	uint8_t press_l;
	uint8_t press_r;
};

struct Key
{
	uint16_t v;
};

struct DT7Remote
{
	struct Remote rc;
	struct Mouse mouse;
	struct Key key;
};

struct DT7Remote remote;	//储存遥控器解码后的数据

uint8_t rc_data[18];	//遥控器原始数据

void RemoteReceiveHandle(void)
{
	Remote.rc.ch0 = ((int16_t)rc_data[0] | ((int16_t)rc_data[1] << 8)) & 0x07FF;
	Remote.rc.ch1 = (((int16_t)rc_data[1] >> 3) | ((int16_t)rc_data[2] << 5)) & 0x07FF;
	Remote.rc.ch2 = (((int16_t)rc_data[2] >> 6) | ((int16_t)rc_data[3] << 2) | ((int16_t)rc_data[4] << 10)) & 0x07FF;
	Remote.rc.ch3 = (((int16_t)rc_data[4] >> 1) | ((int16_t)rc_data[5]<<7)) & 0x07FF;

	Remote.rc.s1 = ((rc_data[5] >> 4) & 0x000C) >> 2;
	Remote.rc.s2 = ((rc_data[5] >> 4) & 0x0003);

	Remote.mouse.x = ((int16_t)rc_data[6]) | ((int16_t)rc_data[7] << 8);
	Remote.mouse.y = ((int16_t)rc_data[8]) | ((int16_t)rc_data[9] << 8);
	Remote.mouse.z = ((int16_t)rc_data[10]) | ((int16_t)rc_data[11] << 8);

	Remote.mouse.press_l = rc_data[12];
	Remote.mouse.press_r = rc_data[13];

	Remote.key.v = ((int16_t)rc_data[14]);
}

int main()
{
	//外设初始化函数
	HAL_UART_Receive_DMA(&huart1, rc_data, 18u);	//使能遥控器串口接收
}

/**
* @brief 串口接收中断回调函数
* @param 串口号
* @retval None
*/
void HAL_UART_RxCpltCallback (UART_HandleTypeDef *huart)
{
	if(huart == &huart1)          //串口1为遥控器的数据接收口
	{
		HAL_UART_Receive_DMA(&huart1, rc_data, 18u);
		RemoteReceiveHandle();      //遥控器数据的具体解析函数
	}
}
```
学到这个程度了，上面的代码大家应该一遍下来都能看懂。

代码最开始定义了一系列关于遥控器数据的结构体，分别储存了手持遥控器的数据、电脑鼠标的移动数据和电脑键盘的按键数据。

然后定义了用于串口接收的变量`rc_data`。这里使用的是DMA的方式进行串口接收。因为遥控器每隔14ms发送了一个18字节长的数据，通过`HAL_UART_Receive_DMA(&huart1, rc_data, 18u);`语句使能遥控器串口接收。

在串口的中断函数里面，进行遥控器的数据处理。当中的处理逻辑完全是照搬遥控器说明书里面的。

将上面的代码写入工程后，进入调试界面，查看`remote`结构器，不出意外的话，就能看见里面的遥控器数据。
> 一般来说只能看到`remote.rc`结构体里面有数据，因为接收电脑数据需要电脑上安装对应的软件，并且使用数据线将遥控器和电脑连接起来，这样电脑的数据可以通过遥控器发送出去。

#电机数据接收
步兵车底盘3508电机可以通过CAN通信获取到电机的数据。获取数据的步骤如下：
```c
uint8_t CanReceiveData[8];	//电机反馈的原始数据

struct CAN_Motor
{
	int fdbPosition;        //电机的编码器反馈值
	int last_fdbPosition;   //电机上次的编码器反馈值
	int bias_position;      //机器人初始状态电机位置环设定值
	int fdbSpeed;           //电机反馈的转速/rpm
	int round;              //电机转过的圈数
	int real_position;      //过零处理后的电机转子位置
};

struct CAN_Motor m3508_1;	//底盘四个电机的数据存储结构体
struct CAN_Motor m3508_2;
struct CAN_Motor m3508_3;
struct CAN_Motor m3508_4;

/*
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

	if (HAL_CAN_Start(hcan) != HAL_OK)
	{
		Error_Handler();
	}

	if (HAL_CAN_ActivateNotification(hcan, CAN_IT_RX_FIFO0_MSG_PENDING) != HAL_OK)
	{
		Error_Handler();
	}

	return HAL_OK;
}

int main()
{
	//初始化外设代码省略
	CanFilterInit(&hcan1);          //初始化CAN1过滤器
}

/*
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

/*
 * @brief 根据电机信息的ID号进行对应的数据解析
 * @param 电机ID号
 * @retval None
 */
void CanDataReceive(int motor_index)
{
	switch(motor_index)
	{
		case CAN_CHASSIS_MOTOR1_ID:
			CanDataEncoderProcess(&m3508_1);break;    //电机数据具体解析函数
		case CAN_CHASSIS_MOTOR2_ID:
			CanDataEncoderProcess(&m3508_2);break;
		case CAN_CHASSIS_MOTOR3_ID:
			CanDataEncoderProcess(&m3508_3);break;
		case CAN_CHASSIS_MOTOR4_ID:
			CanDataEncoderProcess(&m3508_4);break;
	}
}

/*
 * @brief CAN通信电机的反馈数据具体解析函数
 * @param 电机数据结构体
 * @retval None
 */
void CanDataEncoderProcess(struct CAN_Motor *motor)
{
	motor->last_fdbPosition = motor->fdbPosition;
	motor->fdbPosition = CanReceiveData[0]<<8|CanReceiveData[1];
	motor->fdbSpeed = CanReceiveData[2]<<8|CanReceiveData[3];

  /* 电机位置数据过零处理，避免出现位置突变的情况 */
	if(motor->fdbPosition - motor->last_fdbPosition > 4096)
	{
		motor->round --;
	}
	else if(motor -> fdbPosition - motor->last_fdbPosition < -4096)
	{
		motor->round ++;
	}
	motor->real_position = motor->fdbPosition + motor->round * 8192;

  /* 将电机速度反馈值由无符号整型转变为有符号整型 */
	if(motor->fdbSpeed > 32768)
	{
		motor->fdbSpeed -= 65536;
	}
}
```
上面的代码也很好懂。首先是CAN接收中断需要的储存数据的变量，这一点和串口通信是一样的，根据说明书知道每一次反馈是8字节的长度。

然后初始化CAN过滤器，这一步在软件里无法配置，所以只有手动添加上述过滤器函数，并在main函数中调用，这样才能进行CAN的接收中断函数。

在中断函数中，调用`HAL_CAN_GetRxMessage(hcan, CAN_RX_FIFO0, &RxHeader, CanReceiveData)`函数接收数据，然后调用`CanDataReceive(RxHeader.StdId);`进行数据解析。在该函数中最终调用了`void CanDataEncoderProcess(struct CAN_Motor *motor)`函数，完成了电机反馈数据的解析。

关于电机的解析函数，可以参考C620的通信协议（前文已给出），我这里只解析了电机的机械角度和转子转速，没有解析电机的转矩电流和电机温度，这两个的解析大家有兴趣的可以去试试。其中电机转速是由方向的，也就是有正负，但是上述处理过程默认没有正负，于是**-1**会处理成**65535**，所以最后手动处理了一下。
##角度过零处理
拿到电机的机械角度还要进行处理，因为存在从**8191到0**或**0到8191**的突变，这是要极力避免的（虽然底盘控制还用不到这个数据，但这里还是说一下）。电机的反馈频率为1KHz，通过实验，在1ms的时间内，电机的机械角度改变值最多也就一两千，所以一旦出现超过**4096** *（这个数据是我测试出来的，数据太小或太大都会出问题，具体原因大家可以自己去研究，推荐数值范围在3000~5000之间取值）*，那么肯定是过了零点（也就是那个突变位置），于是我把转子的圈数修正，并结合圈数和机械角度算出当前的真正机械角度，该数值连续变化，范围为-∞ ~ +∞（不考虑数据类型的上限的话）。过零处理的代码再单独拿出来看一下：
```c
/* 电机位置数据过零处理，避免出现位置突变的情况 */
if(motor->fdbPosition - motor->last_fdbPosition > 4096)
{
	motor->round --;
}
else if(motor -> fdbPosition - motor->last_fdbPosition < -4096)
{
	motor->round ++;
}
motor->real_position = motor->fdbPosition + motor->round * 8192;
```
和遥控器的数据接收一样，把上述代码放进工程中，然后进入调试，查看`m3508_x`结构体，不出意外就会收到电机反馈的消息。
#电机的速度环
既然接收到了电机的数据，我们就可以加入PID控制电机的速度了*（什么？你问为什么要控制速度？再见！告辞！）*。首先还是看一看怎么发送信息给电机。
##给电机发送信息
```c
/*
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
把上述代码和C620的通信协议结合起来看。我们只需要给电调发送一个转矩电流的数字就行了，在上述代码中，我把16位的转矩电流拆分成了2个8位的数据，其实就是数据接收的逆过程。然后调用`HAL_CAN_AddTxMessage(hcanx,&TxMessage,TxData,(uint32_t*)CAN_TX_MAILBOX0)`函数将数据发送出去。

这里强调一下，我的代码里面使用的是CAN的**RX0**接收，发送使用的**CAN_TX_MAILBOX0**，也就是邮箱0，与这个配置不同的同学谨慎复制代码。

好，至此，我们电机速度环需要的反馈值fdb和输出值output都已经搞定了，现在来看看电机速度环的PID计算。
##速度环
其实就是一个很普通很普通的PID公式，而且我这里只使用了P系数，I和D均为0。
```c
/*
 * @brief PID计算函数。本PID增量式PID，未设置死区
 * @param None
 * @retval None
 */
void PID_Calc(struct PID_t *pid)
{
	pid->error[0] = pid->error[1];
	pid->error[1] = pid->ref - pid->fdb;
	pid->error_sum += pid->error[1];

	/* 积分上限 */
	if(pid->error_sum > pid->error_max) pid->error_sum = pid->error_max;
	if(pid->error_sum < -pid->error_max) pid->error_sum = -pid->error_max;

	pid->output = pid->KP*pid->error[1] + pid->KI*pid->error_sum+pid->KD*(pid->error[1]-pid->error[0]);

	/* 输出上限 */
	if(pid->output > pid->outputMax) pid->output = pid->outputMax;
	if(pid->output < -pid->outputMax) pid->output = -pid->outputMax;
}
```
要给每一个电机都指定一个PID结构体。
```c
struct PID_t
{
	float KP;
	float KI;
	float KD;
	int error[2];
	int error_sum;
	int error_max;
	int fdb;
	int ref;
	int output;
	int outputMax;
};

/* 修改前面的电机数据结构体，在当中加入一个PID结构体 */
struct CAN_Motor
{
	int fdbPosition;        //电机的编码器反馈值
	int last_fdbPosition;   //电机上次的编码器反馈值
	int bias_position;      //机器人初始状态电机位置环设定值
	int fdbSpeed;           //电机反馈的转速/rpm
	int round;              //电机转过的圈数
	int real_position;      //过零处理后的电机转子位置
	struct PID_t speed_pid;     //电机速度环PID
};
```
在这里先停一停，PID计算怎么能没有电机的速度环设定值ref呢，下面就揭开底盘驱动 的核心代码。
##麦克纳姆轮解析
首先把遥控器用上，用遥控器控制底盘的运动。
```c
struct Chassis_t
{
	int FBSpeed;
	int LRSpeed;
	int RotateSpeed;
};

struct Chassis_t chassis;	//存储机器人底盘的速度

chassis.FBSpeed = (remote.ch1 - CH0_BIAS);
chassis.LRSpeed = (remote.ch0 - CH1_BIAS);
chassis.RotateSpeed = (remote.ch2 - CH2_BIAS);

m3508_1.speed_pid.ref = chassis.FBSpeed + chassis.LRSpeed + chassis.RotateSpeed;
m3508_2.speed_pid.ref = -chassis.FBSpeed + chassis.LRSpeed + chassis.RotateSpeed;
m3508_3.speed_pid.ref = -chassis.FBSpeed - chassis.LRSpeed + chassis.RotateSpeed;
m3508_4.speed_pid.ref = chassis.FBSpeed - chassis.LRSpeed + chassis.RotateSpeed;
```
我首先定义了一个用于储存底盘电机前后、左右和旋转的数据，然后将遥控器的摇杆数据与底盘数据挂钩。上面代码中的`CHx_BIAS`是对应摇杆的中间值，默认是**1024** ~~*（为什么？看说明书啊！傻×！）*~~。

接下来四句话就是麦克纳姆轮底盘电机速度解析的全部了，可以结合前面的推荐的那篇博客学习理解。注意这里的算式中的正负号是与底盘电机的ID号分布密切相关的，这里的表达式只适用于我这种ID号分布。
##PID计算
到这一步就不需要我说啥了，万事俱备，只欠东风。算！
```c
m3508_1.speed_pid.fdb = m3508_1.fdbSpeed*0.136f;    //更新电机速度反馈值
m3508_2.speed_pid.fdb = m3508_2.fdbSpeed*0.136f;
m3508_3.speed_pid.fdb = m3508_3.fdbSpeed*0.136f;
m3508_4.speed_pid.fdb = m3508_4.fdbSpeed*0.136f;

PID_Calc(&m3508_1.speed_pid);         //进行PID速度环计算
PID_Calc(&m3508_2.speed_pid);
PID_Calc(&m3508_3.speed_pid);
PID_Calc(&m3508_4.speed_pid);
```
上面的代码有一个很神奇的系数`0.136f`诶，这个数怎么算出来的大家自己去摸索吧，其实去掉它也影响不大。
##发送PID结果
然后是最后一步，把PID的output发送出去。
```c
CanTransmit_1234(&hcan1, m3508_1.speed_pid.output, m3508_2.speed_pid.output, m3508_3.speed_pid.output, m3508_4.speed_pid.output);
```
#总结
坦白说，上面的代码原封不动抄进工程里面是不行的，因为这里面还涉及到一些函数执行的方式，比如电机的PID计算和数据发送是要高频进行的（但是频率不能高于1KHz），遥控器改变电机PID的速度设定值这个函数也是要循环执行的，这个我不细说，留给大家自己去探索。

最后说一句，底盘驱动真的很简单很基础啊！