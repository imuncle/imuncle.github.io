最近正值期末考试，今天刚考完一门，昨晚上实在是不想复习了，正想着怎么办的时候，突然想把复习的考点放在自己的博客上，正好我半年前搭建了一个博客，打开一看发现只有最开始搭建的时候的一篇博客，感觉很失败。

之前的这篇博客采用的是Hexo+NexT框架搭建的，但是我的电脑几经改装，系统也重装了几次，node.js早就没了，想要继续维护这个博客有些麻烦，索性全删了，从头手写一个博客。

首先明确目标，我对博客要求不高，能发文章就行了，所以博客的功能就两点：发文章、读文章。当然，最基本的文章分类是必须的。

然后开始找模板，因为我个人的UI设计能力实在堪忧，只有借鉴别人的设计。我仍然选择在[NexT主题](https://hexo.io/themes)中寻找，很快我找到了一个[不错的博客样式](http://lalala.lol)。然后我就使用自卑鄙的手段，按下`F12`查找元素的样式，顺手把图也扒了下来，基本上还原了博客的样式。
#渐变动画
博客里有**内容渐变动画**和**菜单动画**，我使用了css+Jquery实现，就拿我的博客的头像来进行说明吧。

头像的部分css样式如下：
```css
.head {
    display: inline-block;
    width: 130px;
    height: 130px;
    border-radius: 50%;
    padding: 3px;
    background: #fff;
    box-shadow: 0 0 5px #95a5a6;
    position: relative;
    top: -68px;
    opacity: 0;
    transform: translateY(-20px);
    transition: all 0.8s;
}
```
上面的样式中最重要的是最后三句话，首先把透明度设置为0隐藏起来，位置向上偏移了20px，然后设置元素的每一次样式变化都在0.8s内匀速完成。

然后我在js代码里面改变它的透明度和偏移量就行了。
```javascript
$(function(){
	$('.head').css("opacity","1");
	$('.head').css("transform","translateY(0)");
});
```
以同样的方法，菜单栏的动画也可以轻松实现。
#手机屏幕适配
在手机端屏幕适配这方面，我选择了bootstrap框架的一小部分，这方面的相关介绍可以参考[bootstrap中文网](http://www.bootcss.com/)，但是使用的不多，主要是两个地方使用。

一个是每个页面下面的文章部分，使用了`container`类，可以根据屏幕的分辨率大小调整文章内容的宽度。

另一个地方是非首页的顶部巨幕，使用了`jumbotron`类。

其实我并没有怎么依赖bootstrap。首页的初始画面会默认填充整个屏幕，这里我使用了css里面自带的一个非常有用的单位。比如我的头像下方的div的样式如下：
```css
.author {
    background: #ecf0f1;
    text-align: center;
    height: 30vh;
}
```
我使用了`vh`单位。在css中，默认将屏幕的长等分为100份，每一份的长度为1vh，这里的`30vh`就是占30%高度。对应的宽度也有`vw`这个单位，使用方法一样。这里需要提示的是，`vw`将滚动条的尺寸也算了进去，所以相对来说没有那么好用。
#动态打字效果
博客首页头像的下方有一个一直在打字的效果，这个是我之前从其他网站上抠下来的，只需要引入这个[typed.js](https://imuncle.github.io/js/typed.js)，然后使用下面的语句调用就行了。
```javascript
$("#changerificwordspanid").typed({
	strings: ["good", "happy", "healthy", "tall"],
	typeSpeed: 100,
	startDelay: 10,
	showCursor: true,
	shuffle: true,
	loop:true
});
```
将上面的Jquery的选择器和`strings`里面的内容替换成自己的就行了。
##文章的发表
这里我选择了MarkDown，众所周知MarkDown使用起来是及其方便的，我采用的就是网页js代码获取`.md`文件的内容后将样式渲染出来。

我使用的是开源的[editor.md](https://pandao.github.io/editor.md/examples/)，非常方便，GitHub地址点[这里](https://github.com/pandao/editor.md)。在我的博客的菜单栏里就可以体验MarkDown。

---
博客的相关搭建技术就是这些，剩下的就是细节的优化了。

我的博客是挂在GitHub上面的，所以可以可以直接点击下面的GitHub按钮查看我的网站源码。