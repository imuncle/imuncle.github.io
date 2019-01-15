#RMlib函数原型被我发现啦！！！
昨晚上无意间发现了一个[博客](https://lonewolferic.github.io/)，没想到居然遇到一位同在打RM的同道中人，这个博客里面干活还是挺多的，今天早上在我继续翻他的博客的时候，发现了我寻找了一年的RMLib里面的PID计算函数。

博客原文链接如下：
[https://lonewolferic.github.io/2018/08/26/Implement-class-with-C/](https://lonewolferic.github.io/2018/08/26/Implement-class-with-C/)

这个还得从去年说起。

去年这个时候我刚处于机械转电控的转型期，刚上手RoboMaster官方开源的`RM2016步兵车代码`，里面有一个封装好的RMLib.lib库，这库里面的东西都看不见，只能通过官方提供的头文件获取库的接口，可以说是一个黑盒。后面我尝试了各种反编译的方法，但最后得到的也只有函数接口而已，还不如官方的头文件详细。

官方给的库有一个文件夹，文件夹结构如下：
```
+RMLib
--common.h
--fifo.h
--LostCounter.h
--pid_regulator.h
--ramp.h
--RMLib.lib
```
经过一个赛季的摸索，每个文件的功能也都摸索得差不多了，该复现的也基本复现了，但还是很好奇里面的代码究竟是怎么样的，而且总感觉自己写的代码或多或少有些缺陷，没有考虑周全。

后来RM官方又开源了ICRA的步兵车底层代码，在里面我看到了`LostCounter.h`和`ramp.h`的实现，看了一下跟我的差不多，有些小开心。

昨天时隔三年，官方又开源了新的RM2019的步兵车底层代码，我从中得知了`fifo.h`的实现方法，但因为我学疏才浅，C语言队列不是太了解，所以看到这份代码只能大喊“卧槽”。

终于，我今天看到了最后一个`pid_regulator.c`的实现，在此记录一下：
```c
typedef struct PID_Regulator_t
{
	float ref;
	float fdb;
	float err[2];
	float kp;
	float ki;
	float kd;
	float componentKp;
	float componentKi;
	float componentKd;
	float componentKpMax;
	float componentKiMax;
	float componentKdMax;
	float output;
	float outputMax;
	float kp_offset;
	float ki_offset;
	float kd_offset;
	void (*Calc)(struct PID_Regulator_t *pid);
	void (*Reset)(struct PID_Regulator_t *pid);
}PID_Regulator_t;
```
```c
void PID_Calc(PID_Regulator_t *pid)
{
    pid->err[1] = pid->err[0];
    pid->err[0] = pid->ref-pid->fdb;
    pid->componentKi += pid->err[0];
    if(pid->componentKi < -pid->componentKiMax)
    {
        pid->componentKi = -pid->componentKiMax;
    }
	else if(pid->componentKi > pid->componentKiMax)
    {
        pid->componentKi = pid->componentKiMax;
    }
	pid->output = pid->kp * pid->err[0] + pid->ki *pid->componentKi + pid->kp*(pid->err[0]-pid->err[1]);
	if ( pid->output > pid->outputMax )
    {
		pid->output = pid->outputMax;
	}
	else if ( pid->output < -pid->outputMax )
    {
		pid->output = -pid->outputMax;
	}
}
```
```c
#define GIMBAL_MOTOR_PITCH_POSITION_PID_DEFAULT \
{\
	0,\
	0,\
	{0,0},\
	PITCH_POSITION_KP_DEFAULTS,\
	PITCH_POSITION_KI_DEFAULTS,\
	PITCH_POSITION_KD_DEFAULTS,\
	1,\
	0,\
	0,\
	4900,\
	1000,\
	1500,\
	0,\
	4900,\
	30,\
	0,\
	0,\
	&PID_Calc,\
	&PID_Reset,\
}\
```
非常nice！