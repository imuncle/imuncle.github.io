#Electron学习（一）
electron基于JavaScript开发，给前端开发者带来了福音，近些年来JavaScript的优势越来越大了。

electron依赖node.js，可以用于开发PC端的桌面应用，而且非常容易跨平台，渐渐得称为桌面应用开发的主流。

##开发环境搭建
首先是安装node.js，下载链接点[这里](http://nodejs.cn/download/)

然后搭建electron开发环境，有两种方式。一种是全局安装：
```
npm install electron -g
```
另一种是局部安装，也就是每一个项目的electron是单独的，互不干扰：
```
npm install --save-dev electron
```
这里我选择的是局部安装的方式。

准备完毕之后在项目的根目录下执行
```
npm init
```
初始化`package.json`文件。然后就可以开始写代码了。
##最简单的electron项目
直接贴出代码：

`index.js`:
```javascript
const { app, BrowserWindow } = require('electron')

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win

function createWindow () {
  // 创建浏览器窗口。
  win = new BrowserWindow({ width: 800, height: 600 })

  // 然后加载应用的 index.html。
  win.loadFile('index.html')

  // 打开开发者工具
  win.webContents.openDevTools()

  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    win = null
  })
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (win === null) {
    createWindow()
  }
})

// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。
```
`index.html`:
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Hello World!</title>
  </head>
  <body>
    <h1>Hello World!</h1>
    We are using node <script>document.write(process.versions.node)</script>,
    Chrome <script>document.write(process.versions.chrome)</script>,
    and Electron <script>document.write(process.versions.electron)</script>.
  </body>
</html>
```
然后执行
```
npm start
```
启动这个electron项目。
##响应事件
编写 GUI 应用要做的最重要的事情就是响应事件，如单击按钮事件、窗口关闭事件等。对于 Electron 应用来说，事件分为如下两类：
* 原生事件
* Web事件

由于 Electron 在创建窗口时需要依赖本地 API，因而有一部分事件属于本地 API 原生的事件。但 Electron 主要使用 Web 技术开发应用，因而用的最多的还是 Web 事件，这些事件的使用方法与传统的 Web 技术完全相同。

Electron 的原生事件有很多，比如窗口关闭事件 `close`、Electron 初始化完成后的事件 `ready`（这个在前面已经讲过了）、当全部窗口关闭后触发的事件 `window-all-closed`（通常在这个事件中完成最后的资源释放工作）、Electron 应用激活后触发的事件（`activate`，在 macOS 上，当单击 dock 图标并且没有其他窗口打开时，通常在应用程序中重新创建一个窗口，因此，一般在该事件中判断窗口对象是否为 null，如果是，则再次创建窗口）。`window-all-closed` 事件先于 `closed` 触发。
##electron应用的特性
- 支持创建多窗口应用，而且每个窗口都有自己独立的 JavaScript 上下文；
- 可以通过屏幕 API 整合桌面操作系统的特性，也就是说，使用 Web 技术编写的桌面应用的效果与使用本地编程语言（如 C++）开发的桌面应用的效果类似；
- 支持获取计算机电源状态；
- 支持阻止操作系统进入省电模式（对于演示文稿类应用非常有用）；
- 支持创建托盘应用；
- 支持创建菜单和菜单项；
- 支持为应用增加全局键盘快捷键；
- 支持通过应用更新来自动更新应用代码，也就是热更新技术；
- 支持汇报程序崩溃；
- 支持自定义 Dock 菜单项；
- 支持操作系统通知；
- 支持为应用创建启动安装器。

##打开对话框
Electron 中提供了一个 Dialog 对象，通过该对象的若干个方法，可以显示不同类型的对话框，如打开文件对话框、保存文件对话框、信息对话框、错误对话框等。

获取 Dialog 对象的代码如下：
```javascript
const remote = require('electron').remote;
const dialog = remote.dialog;
```
或者使用下面的代码：
```javascript
const {dialog} = require('electron')
```
打开对话框通过 showOpenDialog 方法显示，该方法的原型如下：
```javascript
dialog.showOpenDialog([browserWindow, ]options[, callback])
```
其中 browserWindow 和 callback 都是可选的，browserWindow 参数允许该对话框将自身附加到父窗口，作为父窗口的模态对话框。callback 是回调函数，用于返回打开文件或目录后的返回值（文件或目录的绝对路径），如果不指定 callback 参数，通过 showOpenDialog 方法返回打开的文件或目录的绝对路径。

options 是必选参数，该参数是一个对象，包含了一些用于设置打开对话框的属性，主要属性的功能及含义如下表所示：

属性|数据类型|功能|可选 / 必选
:--|:--|:--|:--
title|String|对话框标题|可选
defaultPath|String|默认路径|可选
buttonLabel|String|按钮文本，当为空时，使用默认按钮文本|可选
filters|Array|过滤器，用于过滤指定类型的文件|可选
properties|Array|包含对话框的功能，如打开文件、打开目录、多选等|必选
message|String|将标题显示在打开对话框顶端|可选

###打开文件对话框
显示打开文件对话框，只需要将 properties 属性值设为 `openFile` 即可，代码如下：
```javascript
function onClick_OpenFile() {
    const label = document.getElementById('label');
    //  显示打开文件对话框，并将选择的文件显示在页面上
    label.innerText= dialog.showOpenDialog({properties: ['openFile']})
}
```
###定制对话框
通过设置 options 对象中的一些属性，可以设置打开对话框的标题、按钮文本和默认目录，代码如下：
```javascript
function onClick_CustomOpenFile() {
    const label = document.getElementById('label');
    var options = {};
    //  设置 Windows 版打开对话框的标题
    options.title = '打开文件';
    //  设置 Mac OS X 版本打开对话框的标题
    options.message = '打开我的文件';
    //  设置按钮的文本
    options.buttonLabel = '选择';
    // 设置打开文件对话框的默认路径（当前目录）
    options.defaultPath = '.';
    options.properties = ['openFile'];
    label.innerText= dialog.showOpenDialog(options)
}
```
###选择指定类型的文件
如果需要打开指定类型的文件，需要设置 filters 属性，例如，下面的代码为打开文件对话框指定了图像文件、视频文件、音频文件等文件类型，文件类型是通过文件扩展名指定的：
```javascript
function onClick_FileType(){
    const label = document.getElementById('label');
    var options = {};
    options.title = '打开文件';
    options.buttonLabel = '选择';
    options.defaultPath = '.';
    options.properties = ['openFile'];
    //  指定特定的文件类型
    options.filters = [
        {name: '图像文件', extensions: ['jpg', 'png', 'gif']},
        {name: '视频文件', extensions: ['mkv', 'avi', 'mp4']},
        {name: '音频文件', extensions: ['mp3','wav']},
        {name: '所有文件', extensions: ['*']}
    ]
    label.innerText= dialog.showOpenDialog(options)
}
```
###打开和创建目录
如果需要打开目录，而不是文件，properties 属性值需要包含 `openDirectory`。在 Windows 下，鼠标右键单击目录的空白处，就会弹出一个菜单，通过该菜单可以完成很多工作，如在当前目录创建一个子目录。但在 Mac OS X 下，没有这个弹出菜单，所以需要使用 `createDirectoryr` 属性在对话框左下角添加一个用于创建目录的按钮才能在当前目录中创建子目录，代码如下：
```javascript
function onClick_OpenAndCreateDirectory() {
    const label = document.getElementById('label');
    var options = {};
    options.title = '打开目录';
    //  createDirectory仅用于Mac OS 系统
    options.properties = ['openDirectory','createDirectory'];
    label.innerText= dialog.showOpenDialog(options)
}
```
###选择多个文件和目录
选择多个文件和目录，需要为 properties 属性指定 'multiSelections' 值。

不过 Mac OS X 和 Windows 的表现有些不太一样。如果要想同时选择多个文件和目录，在 Mac OS X 下需要同时为 properties 属性指定 'openFile' 和 'openDirectory'，而在 Windows 下，只需要为 properties 属性指定 'openFile' 即可。

如果在 Windows 下指定了 'openDirectory'，不管是否指定 'openFile'，都只能选择目录，而不能显示文件（对话框中根本就不会显示文件），所以如果要让 Mac OS X 和 Windows 都能同时选择文件和目录，需要单独考虑每个操作系统，代码如下：
```javascript
function onClick_MultiSelection() {
    const label = document.getElementById('label');
    var options = {};
    options.title = '选择多个文件和目录';
    options.message = '选择多个文件和目录';
    //  添加多选属性和打开文件属性
    options.properties = ['openFile','multiSelections'];
    //  如果是Mac OS X，添加打开目录属性
    if (process.platform === 'darwin') {
        options.properties.push('openDirectory');
    }
    label.innerText= dialog.showOpenDialog(options)
}
```
###通过回调函数返回选择结果
showOpenDialog 方法的最后一个参数用于指定一个回调函数，如果指定了回调函数，showOpenDialog 方法就会通过回调函数的第 1 个参数返回选择的文件和目录，该回调函数的第 1 个参数是**字符串数组**类型的值。
```javascript
function onClick_Callback() {
    const label = document.getElementById('label');
    var options = {};
    options.title = '选择多个文件和目录';
    options.message = '选择多个文件和目录';

    options.properties = ['openFile','multiSelections'];
    if (process.platform === 'darwin') {
        options.properties.push('openDirectory');
    }
   //  指定回调函数，在回调函数中通过循环获取选择的多个文件和目录
    dialog.showOpenDialog(options,(filePaths) =>{
        for(var i = 0; i < filePaths.length;i++) {
            label.innerText += filePaths[i] + '\r\n';
        }

    });
}
```
##保存对话框
使用 showSaveDialog 方法可以显示保存对话框，保存对话框与打开对话框类似，需要自己输入要保存的用户名，当然，也可以选择已经存储的文件名，不过这样一来就会覆盖这个文件。

这里要强调一点，保存对话框只是提供了要保存的文件名，至于是否保存文件、以何种文件格式保存，保存对话框并不负责，需要另外编写代码解决。

showSaveDialog 方法与 showOpenDialog 方法的参数类似，下面的代码演示了如何用 showOpenDialog 方法来显示保存对话框返回的文件名。
```javascript
function onClick_Save() {
    const label = document.getElementById('label');
    var options = {};
    options.title = '保存文件';
    options.buttonLabel = '保存';
    options.defaultPath = '.';
    //Only Mac OS X，输入文件名文本框左侧的标签文本
    options.nameFieldLabel = '请输入要保存的文件名';
    //是否显示标记文本框，默认值为True
    //options.showsTagField = false;
    //设置要过滤的图像类型  
    options.filters = [
        {name: '图像文件', extensions: ['jpg', 'png', 'gif']},
        {name: '视频文件', extensions: ['mkv', 'avi', 'mp4']},
        {name: '音频文件', extensions: ['mp3','wav']},
        {name: '所有文件', extensions: ['*']}
    ]
    //显示保存文件对话框，并将返回的文件名显示页面上
    label.innerText= dialog.showSaveDialog(options)
}
```
showSaveDialog 方法同样也可以指定回调函数，下面的代码通过回调函数得到保存对话框返回的文件名。
```javascript
function onClick_SaveCallback() {
    const label = document.getElementById('label');
    var options = {};
    options.title = '保存文件';
    options.buttonLabel = '保存';
    options.defaultPath = '.';
    //  Only Mac OS X
    options.nameFieldLabel = '请输入要保存的文件名';
    // 
    options.showsTagField = false;
    options.filters = [
        {name: '图像文件', extensions: ['jpg', 'png', 'gif']},
        {name: '视频文件', extensions: ['mkv', 'avi', 'mp4']},
        {name: '音频文件', extensions: ['mp3','wav']},
        {name: '所有文件', extensions: ['*']}
    ]
    dialog.showSaveDialog(options,(filename) => {
        label.innerText = filename;
    })
}
```
##显示对话框消息
通过 showMessageBox 方法，可以显示各种类型的对话框。该方法的参数与前面介绍的方法类似。
###最简单的对话框
最简单的消息对话框，需要设置对话框标题和显示的消息。标题使用 title 属性设置，消息使用 message 属性设置，实现代码如下。
```javascript
function onClick_MessageBox() {
    const label = document.getElementById('label');
    var options = {};
    options.title = '信息';
    options.message = '这是一个信息提示框';
    //  设置对话框的图标
    // options.icon = '../../../images/note.png';  
    label.innerText= dialog.showMessageBox(options)
}
```
###对话框类型
对话框有多种类型，如信息对话框、错误对话框、询问对话框和警告对话框，这些对话框的类型通过 type 属性设置，其值如下
- 默认对话框：none
- 信息对话框：info
- 错误对话框：error
- 询问对话框：question
- 警告对话框：warning

```javascript
function onClick_MessageBox() {
    var options = {};
    options.title = '警告';
    options.message = '这是一个警告提示框';
   // 设置对话框类型
    options.type = 'warning';
    dialog.showMessageBox(options)
}
```
###对话框按钮
通过 buttons 属性可以设置对话框的按钮，默认只显示一个按钮，buttons 属性是字符串数组类型，每一个数组元素代表一个按钮的文本：
```javascript
function onClick_MessageBox() {
    var options = {};
    options.title = '警告';
    options.message = '这是一个警告提示框';
    options.icon = '../../../images//note.png';
    options.type = 'warning';
    options.buttons = ['按钮1','按钮2','按钮3','按钮4','按钮5']
    //  获取单击按钮的索引，并将索引输出到控制台
    dialog.showMessageBox(options,(response) => {
        console.log('当前被单击的按钮索引是' + response);
    })
}
```
###错误提示对话框
通过 showErrorBox 方法可以非常容易地显示错误对话框，该方法只有两个参数，第一个参数表示标题，第二个参数表示内容，下面的代码显示了错误对话框：
```javascript
function onClick_ErrorBox() {
    var options = {};
    options.title = '错误';
    options.content = '这是一个错误'
    dialog.showErrorBox('错误', '这是一个错误');
}
```
##使用 HTML 5 API 创建子窗口
在 Electron 中还存在一种创建窗口的方式，就是使用 HTML 5 的 API 创建窗口。在 HTML 5 中提供了 window.open 方法用于打开一个子窗口，该方法返回一个 BrowserWindowProxy 对象，并且打开了一个功能受限的窗口。

window.open 方法的原型如下：
```javascript
window.open(url[, title] [,attributes])
```
* url：要打开页面的链接（包括本地页面路径和 Web 链接）。
* title：设置要打开页面的标题，如果在要打开页面中已经设置了标题，那么这个参数将被忽略。
* attributes：可以设置与窗口相关的一些属性，如窗口的宽度和高度，其中第 1 个参数是必选的，第 2 个和第 3 个参数是可选的。

```javascript
function onClick_OpenWindow1() {
    // 通过 open 方法指定窗口的标题时，子窗口不能设置 <title> 标签
    win = window.open('./child.html','新的窗口','width=300,height=200')
}
```
###控制子窗口的焦点及关闭子窗口
```javascript
//获得焦点
function onClick_Focus() {
    if(win != undefined) {
       win.focus();
    }
}
//失去焦点
function onClick_Blur() {
    if(win != undefined) {
        win.blur();
    }
}

//关闭子窗口
function onClick_Close() {
    if (win != undefined) {
        //  closed 属性用于判断窗口是否已关闭
        if(win.closed)
        {
            alert('子窗口已经关闭，不需要再关闭');
            return;
        }
        win.close();
    }
}

//  调用子窗口中的打印对话框
function onClick_PrintDialog() {
    if (win != undefined) {
        win.print();
    }
}
```
##子窗口交互
* child.html
```html
<!DOCTYPE html>
<html>
<head>
  <!--  指定页面编码格式  -->
  <meta charset="UTF-8">
  <!--  指定页头信息 -->
  <title>BrowserWindowProxy与open方法</title>
  <script src="event.js"></script>
</head>
<body onload="onLoad()">
    <h1>子窗口</h1>
    <button onclick="onClick_Close()">关闭</button>
    <label id="label"></label>
</body>
</html>
```
* index.html
```html
<!DOCTYPE html>
<html>
<head>
    <!--指定页面编码格式 -->
    <meta charset="UTF-8">
    <!--指定页头信息-->
    <title>BrowserWindowProxy与open方法</title>
    <script src="event.js"></script>
</head>
<body>
    <button onclick="onClick_OpenWindow()">打开子窗口</button>
    <br>
    <br>
    <button onclick="onClick_Message()">向子窗口发送消息</button>
    <br>
    <br>
    <button onclick="onClick_Eval()">向子eval方法窗口发送消息</button>
    <br>
    <br>
    <label id="label" style="font-size: large"></label>
</body>
</html>
```
* event.js

```javascript
const remote = require('electron').remote;
const dialog = remote.dialog;
const ipcMain = remote.ipcMain;
const {ipcRenderer} = require('electron')
ipcMain.on('close', (event, str) => {
    alert(str);
});
var win;
//创建并显示一个主窗口
function onClick_OpenWindow() {
    win = window.open('./child.html','接收消息','width=300,height=200')
}

function onClick_Message() {
    // postMessage 方法的第 1 个参数用于指定要传递的数据，第 2 个参数是来源，一个字符串类型的值，如果不知道来源，可以使用 '*'
    win.postMessage('abcd', '*');

}

var label
function onLoad() {
    label = document.getElementById('label');
    // 当使用 postMessage 方法传递数据时，接收数据的页面就会触发 message 事件
    // 并通过事件回调函数参数的 data 属性得到传过来的数据。
    window.addEventListener('message', function (e) {
        alert(e.origin);
        label.innerText = e.data
    });
}

function onClick_Close() {
    const win  =  remote.getCurrentWindow();
    //  返回数据，其中 close 是事件名
    ipcRenderer.send('close','窗口已经关闭');
    win.close();
}
//  以下代码在主窗口中：在主线程中接收 close 事件
ipcMain.on('close', (event, str) => {
    //  str参数就是字窗口返回的数据 
    alert(str);
});

function onClick_Eval() {
    //通过 eval 方法设置 child 窗口中的 label 标签
    // eval 方法用于执行子窗口中的代码，也就是说，使用 eval 方法执行的 JavaScript 代码的上下文是子窗口的
    win.eval('label.innerText="hello world"')
}
```
暂时先学到在这里。