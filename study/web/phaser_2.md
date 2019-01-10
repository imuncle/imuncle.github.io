#Phaser 飞机大战学习-第二课
##图片加载
背景图片科技使用`game.add.image(0,0,'backgroud')`，也可以使用`game.add.sprite(0,0,'background')`。
##帧动画加载
帧动画加载就必须用`game.add.sprite`函数
帧动画在加载资源的时候就已经处理好了，使用的是`game.load.spritesheet`函数
但是现在加载出来是没有动画的，让他动起来的步骤如下：
```javascript
var myplane = game.add.sprite(100, 100, 'myplane');
myplane.animations.add('fly');
myplane.animations.play('fly');
```
但是逐帧动画默认不循环，所以应该这样写：
```javascript
myplane.animations.play('fly', 12,  true);
//第一个参数是动画的名称，第二个参数是帧动画播放的快慢，第三个参数指定是否循环播放
```
##添加一个开始按钮
使用了一个button函数，函数定义如下
```javascript
new Button(game, x, y, callback, callbackContext, overFrame, outFrame, downFrame, upFrame);//Phaser.Button
//回调函数，回调函数上下文，鼠标放上去的帧，移开的帧，按下的帧，抬起的帧
```
添加开始按钮的代码如下：
```javascript
game.MyStates.start = {
	create: function() {
		//背景，飞机动画的加载
		game.add.button(70, 200, 'startbutton', this.onStartClick, this, 1, 1, 0);
	},
	
	onStartClick: function() {
		console.log('click');
	}
}
```
下面添加一个游戏中的场景
```javascript
game.MyStates.play= {
	create: function() {
		game.add.tileSprite(0, 0, game.width, game.height, 'backgound');		//里面的资源会平铺
	}
}
```
上面的背景需要滚动，所以选用了tileSprite。但是上面的代码实现的是平铺的效果，如果要实现滚动效果，需要这样写：
```javascript
var bg = game.add.tileSprite(0, 0, game.width, game.height, 'backgound');
bg.autoScoll(0, 20);	//水平方向不滚动，竖直方向滚动速度20
```
##渐变动画
初始状态给飞机添加一个渐变动画
```javascript
game.MyStates.play= {
	create: function() {
		game.add.tileSprite(0, 0, game.width, game.height, 'backgound');		//里面的资源会平铺
		bg.autoScoll(0, 20);	//水平方向不滚动，竖直方向滚动速度20
		var myplane = game.add.sprite(100, 100, 'myplane');
		myplane.animations.add('fly');
		myplane.animations.play('fly');
		game.add.tween(myplane).to({y: game.height - 40}, 1000, null, true);		//函数用法参考Phaser.Tween。动画效果、动画时间，简便类型（null表示默认 Phaser.Easing），自动播放
	}
}
```
可以给渐变动画加上一个回调函数，上述代码改写如下：
```javascript
create: function() {
	//省略代码
	var tween = game.add.tween(myplane).to({y: game.height - 40}, 1000, null, true);
	tween.onComplete.add(this.onStart, this);
}

onStart: function() {
	console.log('onStart');
}
```
##添加分数
飞机渐变动画结束之后在左上角添加分数。
```javascript
onStart: function() {
	//console.log('onStart');
	var style = {font: "16px Arial", fill: "#ff0000"};
	var text = game.add.text(0, 0, "Scroe: 0", style);
}
```
##飞机拖拽
前面加载飞机场景的时候使用的是`var myplane = game.add.sprite(100, 100, 'myplane');`这样是不能实现拖拽的，要改成`this.myplane = game.add.sprite(100, 100, 'myplane');`之后和`myplane`相关的语句都要加上`this`。然后使用phaser自带的一些函数来实现飞机的拖拽效果。
```javascript
onStart: function() {
	this.myplane.inputEnabled = true;	//允许输入
	this.myplane.input.enableDrag(false);	//允许拖动
}
```
##实现子弹
一个方法就是使用定时器实现，还可以使用粒子发射器实现。这里直接在update里面实现子弹。
```javascript
onStart: function() {
	//省略
	this.myplane.myStartFire = true;	//先定义一个开火的标记。
},
update: function() {
	if(this.myplane.myStartFire) {
		var myBullet = game.add.sprite(this.myplane.x, this.myplane.y, 'mybullet');	//后面要进行物理碰撞，所以使用sprite
	}
}
```
接下来给整个游戏加上物理引擎
```javascript
game.MyStates.play = {
	create: function() {
		game.physics.startSystem(Phaser.Phsics.ARCADE);
	},
	update: function() {
		game.physics.enable(myBullet, Phaser.Physics.ARCADE);
		myBullet.body.velocity.y = -200;
	}
}
```
上面的子弹发射的特别快
```javascript
update:
	var now = new Date().getTime();
	if(this.myplane.myStartFire && now - this.lastBulletTime > 500) {
		//发射子弹
		this.lastBulletTime = now;
	}
onStart: function() {
	this.lastBulletTime = 0;
}
```
上面给子弹加物理引擎的`game.physics.enable(myBullet, Phaser.Physics.ARCADE);`这一句可以换成`game.physics.arcade.enable(this.myBullet)`
下面让飞机不超出画面
```javascript
game.physics.arcade.enable(this.myplane);
this.myplane.body.collideWorldBounds= true;		//只有打开物理引擎之后才有body属性
```
##添加敌机
```javascript
this.enemy = game.add.sprite(100,10,'enemy1');
game.physics.arcade.enable(this.enemy);
```
##给子弹创建group
```javascript
onStart: function() {
	this.myBullets = game.add.group();
	this.myBullets.enableBody = true;	//给group开始物理引擎
}
update: function() {
	if(this.myplane.myStartFire && now - this.lastBulletTime > 500) {
		//发射子弹
		this.myBullets.add(myBullet);
	}
	game.physics.arcade.overlap(this.myBullets, this.enemy, this.collisionHandle, null, this);	//碰撞检测
	//game.physics.arcade.collide();可以实现碰撞效果，设置质量可以看见
}
collisionHandle: function() {
	//碰撞的回调函数
	console.log('collisionHandle');
}
```
击杀敌机
```javascript
collisionHandle: function(enemy, bullet) {
	enemy.kill();
	bullet.kill();
}
```

---
以上是phaser小站的教程的第二课内容。