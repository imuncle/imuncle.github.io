#Phaser 飞机大战学习-第一课
从前年开始我就一直想进军H5游戏的领域，但是当时知识尚欠，连CANVAS这个标签都学不下去，后来我接触到了[three.js](https://github.com/mrdoob/three.js)和[pixi.js](https://github.com/pixijs/pixi.js)，一个是3D的，基于WebGL，一个是2D的，都很厉害，但最后都因为各种原因没有学下去。

前段时间我接触无意间接触到了phaser.js，这个游戏框架是专门用于2D游戏开发的，其实不只是开发游戏，动画也是可以做的。phaser.js框架好处在于它的小巧，而且是基于pixi.js的，入手很方便，但目前它的中文资料还不是很多，中文资料里面最赞的是[phaser小站](https://www.phaser-china.com/)，我的phaser学习也是通过这个小站入门的，这里就记录一下我前段时间学习phaser的一些收获。
#创建游戏场景
首先明确一点，phaser是基于canvas绘图的，使用起来也很简单，只需要在html里面建立一个div标签并指定id，然后引入phaser.min.js文件，最后创建游戏就行了，最简单的代码如下：
```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
		<title>your title here</title>
		<script src="../phaser.min.js"></script>
	</head>
	<body>
		<div id="game" class="game"></div>
	</body>
</html>
```
```javascript
var game = new Phaser.Game(240, 400, Phaser.CANVAS, 'game');
```
这时候在服务器上运行，就会发现网页中出现了一个240×400的黑块，这就是我们的游戏界面，查看DOM元素可以发现phaser在我定义的div标签中创建了一个canvas，然后在canvas里面实时渲染。

上面的代码中创建游戏场景只有一句话，也就是`new Phaser.Game`，游戏的每一个场景又可以分为`preload`,`create`,`update`几个阶段，每一个阶段都可以指定对应的函数操作，显然游戏中最重要的就是update这个阶段，我们一般在preload中加载我们游戏场景所需要的资源，在`create`中使用资源创建场景，然后在`update`中不断得更新场景，比如实现游戏逻辑，监听用户输入等等。

那么怎么为每个阶段指定函数呢？主要有两种，第一种如下：
```javascript
var game = new Phaser.Game(240, 400, Phaser.CANVAS, 'game', {preload: preload, create: create, update: update});	//如果是手机游戏，一定要选用Phaser.CANVAS
function preload() {
  console.log("preload");
}

function create() {
  console.log('create');
}

function update() {
  console.log('update');
}
```
上面的代码是直接在创建的时候将每一个阶段的操作以对象的方式传给`Phaser.Game`，也可以换成下面的写法，更美观好看一点：
```javascript
var state = {preload: preload, create: create, update: update};	//游戏场景

function preload() {
  console.log("preload");
}

function create() {
  console.log('create');
}

function update() {
  console.log('update');
}

game.state.add('state', state);
```
这样的好处是可以添加多个场景。

另一种方式是以函数的形式添加：
```javascript
function state() {
  this.preload = function() {
    console.log("preload");
  }

  this.create = function() {
    console.log("create");
  }

  this.update = function() {
    console.log("update");
  }
}

game.state.add('state', new state());
```
当然两种方法，第一种方法是更好一点。

接下来我们可以对我们的代码做一些优化。假设我们的游戏有多个场景（事实上这是很有可能的），那么我们可以在game下面建一个场景的组合：
```javascript
game.MyStates = {};

game.MyStates.state1 = {
  preload: function() {
    console.log("preload1");
  },
  create: function() {
    console.log("create1");
  },
  update: function() {
    console.log("update1");
  }
};

game.state.add('state1', game.MyStates.state1);
```
光添加这些场景还不行，我们还要启动场景，场景启动以后画面才会显示出来。场景启动的代码就一句话：
```javascript
game.state.start('state2');
```
到目前为止我么的场景就建好了，现在就可以在浏览器中感受`preload`，`create`，`update`之间的区别和特点了。
#为游戏添加背景
现在我们的游戏还只是一个黑块，里面什么东西都没有，现在向其中添加一张图片作为游戏背景。
```javascript
game.MyStates.state1 = {
  preload: function() {
    //console.log("preload1");
	game.load.image('background', 'assets/bg.jpg');
  },
  create: function() {
    //console.log("create1");
	var bg = game.add.tileSprite(0, 0, game.width, game.height, 'background');	//里面的资源会平铺
	bg.autoScoll(0, 20);	//水平方向不滚动，竖直方向滚动速度20
  },
  update: function() {
    console.log("update1");
  }
};
```
上述代码的功能其实已经显而易见了。这里只有一点要注意，那就是背景使用的是`tileSprite`，因为背景要实现不断地滚动，开启滚动就使用`autoScoll`函数。
#游戏场景切换
游戏当然不只是一个场景啦，那么怎么实现场景切换呢？也很简单，只需要在其中一个场景里面启动另一个场景就行了。
```javascript
game.MyStates.load = {
  preload: function() {
    //加载资源，加载完毕之后才会执行create方法
	game.load.image('background', 'assets/bg.jpg');
  },
  create: function() {
    game.state.start('state1');
  }
}
```
这里我把加载资源的操作单独放在了一个场景当中，等资源加载完毕之后再跳转到场景`state1`中。

这里有一个小知识点，就是场景切换的时候可以选择清空所有的场景中所有的精灵，也可以选择保留，但一般来说都是选择清空所有的精灵，这样子编程的时候逻辑也会更加清晰一点。
#加载进度条
如果资源加载过多，那么游戏就会先黑屏很久然后才开始启动画面，这样用户体验是不太好的，如果给资源的加载过程以一个进度条的形式展示出来就是一个很好的解决办法。

进度条的加载方法如下：
```javascript
game.MyStates.load = {
  preload: function() {
    //加载资源，加载完毕之后才会执行create方法
    var preloadSprite = game.add.sprite(10, game.height/2, 'loading');    //资源加载进度条
    game.load.setPreloadSprite(preloadSprite);
    game.load.image('background', 'assets/bg.jpg');
  },
  create: function() {
  	game.state.start('state1');
  }
}
```
比较遗憾的是，phaser目前还不支持显示GIF动画，所有的GIF图片都只显示第一帧。

另外我们还可以获取资源加载的进度：
```javascript
game.load.onFileComplete.add(function(process) {
	//给每个加载动作都绑定一个回调函数
	//console.log(arguments);
	console.log(process);
});
```
我们可以给每个加载动作都绑定一个回调函数，可以通过`arguments`获取到一共要加载的资源数，已经加载的资源数等信息，非常方便。
#屏幕适配
目前最火爆的当然是移动端，手机正在渐渐代替电脑的部分功能，很多东西都慢慢得适配了移动端，我们开发游戏也是一样。但是移动端的设备的屏幕分辨率并不是一样的，要是游戏全屏肯定是不能直接指定游戏的画布大小的，那么怎么解决呢？phaser早已想到了这一点。
```javascript
game.MyStates.boot = {
  preload: function() {
    game.load.image('loading', 'assets/preloader.gif');
    if(!game.device.desktop) {    //如果不是电脑端，则适配屏幕
      game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;   //完全填充
      //game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;      //没有拉升变形，尽量填充整个屏幕
    }
  },
  create: function() {
    game.state.start('load');
  }
}
```
这里我又创建了一个在load前面的场景（当然图方便也可以不要这个场景），首先判断是不是PC端访问，如果不是，那么久完全填充整个屏幕，`EXACT_FIT`是拉伸填充屏幕，可能会因为长宽比的不同而使游戏画面有轻微变形，`SHOW_ALL`则是在保证原比例尺寸的前提下最大化填充整个屏幕，具体的选择看具体的项目需求。

---
以上是phaser小站教程的第一课内容。