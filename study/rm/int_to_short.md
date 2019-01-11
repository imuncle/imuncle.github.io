#关于电机数据为无符号整形的处理
前段时间我使用电机的时候，在电机的数据结构体中都是使用int类型
```c
struct CAN_Motor
{
    int fdbPosition;        //电机的编码器反馈值
    int last_fdbPosition;   //电机上次的编码器反馈值
    int bias_position;      //机器人初始状态电机位置环设定值
    int fdbSpeed;           //电机反馈的转速/rpm
    int round;              //电机转过的圈数
    int real_position;      //过零处理后的电机转子位置
};
```
电机的通信协议如下：

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

我的接收处理是这样的：
```c
motor->position = CanReceiveData[0]<<8|CanReceiveData[1];
motor->speed = CanReceiveData[2]<<8|CanReceiveData[3];
```
但是这样有个问题，就是当速度为负值的时候，比如现在电机转速是`-1`，但是我接收到的数据为`65535`，也就是原本应该是有符号的整形变成了无符号整形，所以我必须加下面的语句手动处理：
```c
/* 将电机速度反馈值由无符号整型转变为有符号整型 */
if(motor->fdbSpeed > 32768)
{
	motor->fdbSpeed -= 65536;
}
```
这样一来就显得非常麻烦，还好现在我找到了解决办法，就是把结构体里面的`int`类型改成`short`类型，就没有这个问题了。
```c
struct CAN_Motor
{
  short position;
  short speed;
};
```
这是因为`short`类型默认是由符号的，取值范围为`-32768~32767`，哪怕输入的确实是`65535`，它也会在数据类型转换的时候自动转变为`-1`，省去了我们手动处理的步骤。