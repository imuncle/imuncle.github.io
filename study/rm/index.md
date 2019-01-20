参加RoboMaster机甲大师赛已经快三年了，从第一年的机械，到第二年的电控，再到今年的队长，肩上的责任也越来越重。

这里记录的是一些搞电控的时候学到的一些知识，虽然都是些小碎片，但小溪终会汇成河流。

漫漫编程路，希望头发能陪我一直走下去。
#文章列表
<ul class="main_content" style="padding-left: 0">
  <li><p class="date">January 20, 2019</p><h4 class="title"><a href="?content=chassis_rotate">步兵底盘小陀螺的实现</a></h4><div class="excerpt"><p>我第一次看见小陀螺的时候是在去年比赛的佛山分区赛，当时我的比赛已经彻底结束了，在备场区看比赛直播，看见了有个战队的步兵可以**360度**旋转，还可以同时实现底盘的前后左右移动，当时死活想不通是怎么实现的。</p><p>昨天逛空间的时候再次看见了这种小陀螺，跑的确实欢快，心里非常羡慕，于是今天下午决心要实现小陀螺。</p></div><ul class="meta"><li>big_uncle</li><li><a href="study/rm/">RM比赛</a></li></ul></li>
  <li><p class="date">January 18, 2019</p><h4 class="title"><a href="?content=hero_pid">英雄车云台PID调试总结</a></h4><div class="excerpt"><p>今天已经18号了，距离出车的deadline已经不远了，留给电控的时间不多了。</p><p>按理说，我如果将位置环失效，只用速度环的话，那么我用手拨动云台，它应该立即停下来，速度减为0，并且基本无振荡。但是出师不利，今天调参已经自闭一天了，所以决定再次学习一下PID的调参和原理。</p><p>昨天和前天已经有好几波人轮流调了英雄车的云台，但都无功而返，眼看死期将至，决定自己还是亲自拼一把。</p></div><ul class="meta"><li>big_uncle</li><li><a href="study/rm/">RM比赛</a></li></ul></li>
  <li><p class="date">January 16, 2019</p><h4 class="title"><a href="?content=pid">PID学习</a></h4><div class="excerpt"><p>今天终于开始调试英雄机器人的云台电机了，我采用的是位置环和速度环的串级PID，也是首先的先调速度环，然后调位置环。方位角和角速度都是靠陀螺仪获取的。</p><p>按理说，我如果将位置环失效，只用速度环的话，那么我用手拨动云台，它应该立即停下来，速度减为0，并且基本无振荡。但是出师不利，今天调参已经自闭一天了，所以决定再次学习一下PID的调参和原理。</p></div><ul class="meta"><li>big_uncle</li><li><a href="study/rm/">RM比赛</a></li></ul></li>
  <li><p class="date">January 16, 2019</p><h4 class="title"><a href="?content=keil_compile">keil选择性编译那些事儿</a></h4><div class="excerpt"><p>今天遇到个非常奇葩的问题，我首先定义了四个全局变量`m3508_1`，`m3508_2`，`m3508_3`，`m3508_4`。</p>```c
struct CAN_Motor
{
    int fdbPosition;        //电机的编码器反馈值
    int last_fdbPosition;   //电机上次的编码器反馈值
    int bias_position;      //机器人初始状态电机位置环设定值
    int fdbSpeed;           //电机反馈的转速/rpm
    int round;              //电机转过的圈数
    int real_position;      //过零处理后的电机转子位置
};

struct CAN_Motor m3508_1 = DEFAULT_MOTOR;    //底盘四个电机的数据存储结构体
struct CAN_Motor m3508_2 = DEFAULT_MOTOR;
struct CAN_Motor m3508_3 = DEFAULT_MOTOR;
struct CAN_Motor m3508_4 = DEFAULT_MOTOR;
```</div><ul class="meta"><li>big_uncle</li><li><a href="study/rm/">RM比赛</a></li></ul></li>
  <li><p class="date">January 15, 2019</p><h4 class="title"><a href="?content=rm_pid_function">RMlib函数原型被我发现啦！！！</a></h4><div class="excerpt"><p>昨晚上无意间发现了一个[博客](https://lonewolferic.github.io/)，没想到居然遇到一位同在打RM的同道中人，这个博客里面干货还是挺多的，今天早上在我继续翻他的博客的时候，发现了我寻找了一年的RMLib里面的PID计算函数。</p><p>博客原文链接如下：</p><p>[https://lonewolferic.github.io/2018/08/26/Implement-class-with-C/](https://lonewolferic.github.io/2018/08/26/Implement-class-with-C/)</p></div><ul class="meta"><li>big_uncle</li><li><a href="study/rm/">RM比赛</a></li></ul></li>
  <li><p class="date">January 14, 2019</p><h4 class="title"><a href="?content=JGA25-371">JGA25-371电机驱动</a></h4><div class="excerpt"><p>这段时间我在帮学校Robocon战队做辅导，遇到了JGA25-371电机，外形如下：</p><p>以前我还没遇到过这种电机，一直用的是大疆的三相无刷电机，而这个是带编码器和减速箱的直流电机，一共6根线，其中四根线是编码器的，两根线是电机的电源线。</p></div><ul class="meta"><li>big_uncle</li><li><a href="study/rm/">RM比赛</a></li></ul></li>
  <li><p class="date">January 13, 2019</p><h4 class="title"><a href="?content=judgement">裁判系统数据读取探索</a></h4><div class="excerpt"><p>RM备赛期间遇到需要读取裁判系统的数据，在此将学习过程记录下来。因为RM2019的裁判系统的通信协议还没有出来，所以我学习的是RM2018版的裁判系统的数据获取。</p><p>USART配置</p><p>我这里选用的是USART2，采用异步通信模式，并使能DMA，同时打开串口全局中断和DMA中断，波特率115200，数据位8位，停止位1位，无奇偶校验位。</p></div><ul class="meta"><li>big_uncle</li><li><a href="study/rm/">RM比赛</a></li></ul></li>
  <li><p class="date">January 11, 2019</p><h4 class="title"><a href="?content=int_to_short">关于电机数据为无符号整形的处理</a></h4><div class="excerpt"><p>前段时间我使用电机的时候，在电机的数据结构体中都是使用int类型。</p>```c
struct CAN_Motor
{
    int fdbPosition;        //电机的编码器反馈值
    int last_fdbPosition;   //电机上次的编码器反馈值
    int bias_position;      //机器人初始状态电机位置环设定值
    int fdbSpeed;           //电机反馈的转速/rpm
    int round;              //电机转过的圈数
    int real_position;      //过零处理后的电机转子位置
};
```</div><ul class="meta"><li>big_uncle</li><li><a href="study/rm/">RM比赛</a></li></ul></li>
  <li><p class="date">January 11, 2019</p><h4 class="title"><a href="?content=jtag_swd">JTAG与SWD接线口转换</a></h4><div class="excerpt"><p>开发STM32时常在20pin的JTAG接口和4pin的SWD接口之间转换，但时间一长就记不住它们的线序对应关系，每次都去百度找感觉很麻烦，这次直接把它录进来。</p></div><ul class="meta"><li>big_uncle</li><li><a href="study/rm/">RM比赛</a></li></ul></li>
  <li><p class="date">January 8, 2019</p><h4 class="title"><a href="?content=infantry_chassis">步兵车底盘驱动</a></h4><div class="excerpt"><p>底盘作为一个机器人最基础的东西，是各位必须掌握的。但是看着大家的任务完成进度感到焦心，所以写了这篇步兵车底盘驱动代码的详解，以及底盘调试的步骤和要点。</p><p>工程简介</p><p>这篇教程里的代码使用STM32F405RGT6芯片，使用STM32CubeMX软件辅助进行开发。</p></div><ul class="meta"><li>big_uncle</li><li><a href="study/rm/">RM比赛</a></li></ul></li>
  <li><p class="date">January 8, 2019</p><h4 class="title"><a href="?content=basic_knowladge">电控基础知识点</a></h4><div class="excerpt"><p>写在最前</p><p>本网页将我这一年（2018年）的电控经历积累下来的知识和经验，以及下半年进行的两次培训的内容和要点做了一个综合总结。</p><p>上半年我一直用的是标准库进行编程，但自从国庆期间用上**HAL库**之后，我被HAL库的便捷深深打动，自此基本放弃了标准库，所以本总结的内容是基于HAL库的，并结合**STM32CubeMX**软件*（因为过程有些繁琐，截图很麻烦，所以本总结并不会贴出STM32CubeMX上的相关配置过程）*。</p></div><ul class="meta"><li>big_uncle</li><li><a href="study/rm/">RM比赛</a></li></ul></li>
</ul>