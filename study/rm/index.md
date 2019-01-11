参加RoboMaster机甲大师赛已经快三年了，从第一年的机械，到第二年的电控，再到今年的队长，肩上的责任也越来越重。

这里记录的是一些搞电控的时候学到的一些知识，虽然都是些小碎片，但小溪终会汇成河流。

漫漫编程路，希望头发能陪我一直走下去。
#文章列表
<ul class="main_content" style="padding-left: 0">
  <li><p class="date">January 11, 2019</p><h4 class="title"><a href="?content=infantry_chassis">JTAG与SWD接线口转换</a></h4><div class="excerpt"><p>开发STM32时常在20pin的JTAG接口和4pin的SWD接口之间转换，但时间一长就记不住它们的线序对应关系，每次都去百度找感觉很麻烦，这次直接把它录进来。</p></div><ul class="meta"><li>big_uncle</li><li><a href="study/rm/">RM比赛</a></li></ul></li>
  <li><p class="date">January 8, 2019</p><h4 class="title"><a href="?content=infantry_chassis">步兵车底盘驱动</a></h4><div class="excerpt"><p>底盘作为一个机器人最基础的东西，是各位必须掌握的。但是看着大家的任务完成进度感到焦心，所以写了这篇步兵车底盘驱动代码的详解，以及底盘调试的步骤和要点。</p><p>工程简介</p><p>这篇教程里的代码使用STM32F405RGT6芯片，使用STM32CubeMX软件辅助进行开发。</p></div><ul class="meta"><li>big_uncle</li><li><a href="study/rm/">RM比赛</a></li></ul></li>
  <li><p class="date">January 8, 2019</p><h4 class="title"><a href="?content=basic_knowladge">电控基础知识点</a></h4><div class="excerpt"><p>写在最前</p><p>本网页将我这一年（2018年）的电控经历积累下来的知识和经验，以及下半年进行的两次培训的内容和要点做了一个综合总结。</p><p>上半年我一直用的是标准库进行编程，但自从国庆期间用上**HAL库**之后，我被HAL库的便捷深深打动，自此基本放弃了标准库，所以本总结的内容是基于HAL库的，并结合**STM32CubeMX**软件*（因为过程有些繁琐，截图很麻烦，所以本总结并不会贴出STM32CubeMX上的相关配置过程）*。</p></div><ul class="meta"><li>big_uncle</li><li><a href="study/rm/">RM比赛</a></li></ul></li>
</ul>