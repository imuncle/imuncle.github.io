#Electron学习（二）

##在窗口中嵌入Web页面
使用`webview`标签可以在窗口中创造另外一个页面。不像 iframe，webview 在与应用程序**不同**的进程中运行，它与你的网页没有相同的权限，应用程序和嵌入内容之间的所有交互都将是**异步**的。
```html
<webview id="webview" src="child.html" style="width:400px; height:300px" ></webview>
```
###相应的页面事件
`webview`标签支持很多事件，例如，did-start-loading 可以监听页面正在装载事件，did-stop-loading 可以监听页面装载完成事件。`webview`标签使用事件的代码如下：
```html
<script>
    onload = () => {
        const webview = document.getElementById('geekori');
        const loadstart = () => {
             console.log('loadstart');
        }
        const loadstop = () => {
            console.log('loadstop');
        }
        webview.addEventListener('did-start-loading', loadstart)
        webview.addEventListener('did-stop-loading', loadstop)
    }
</script>
```
装载的页面在默认情况下是不能调用 Node.js API 的，但添加 nodeintegration 属性后，页面就可以使用 Node.js API 了：
```html
<webview id="other" src="./other1.html" style="width:400px; height:300px" nodeintegration></webview>
```
`webview`标签有很多方法，这里介绍一些常用的方法，代码如下：
```javascript
webview = document.getElementById('web');
//装载新的页面
webview.loadURL('https://www.baidu.com');
//重新装载当前页面
webview.reload();
//获取当前页面的标题
console.log(webview.getTitle());
//获取当前页面对应的 URL
console.log(webview.getURL());
const title = webview.getTitle();
//在装载的页面执行 JavaScript 代码
webview.executeJavaScript('console.log("' + title + '");')
//打开调试工具
webview.openDevTools()
```
###屏幕API
通过 screen 对象提供的方法，可以获得与屏幕相关的值：
```javascript
const electron = require('electron')
const {app, BrowserWindow} = electron
const remote = electron.remote;
function onClick_Test() {
    const win = remote.getCurrentWindow();
    //  获取当前屏幕的宽度和高度（单位：像素）
    const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
    win.setSize(width,height,true)
    console.log('width:' + width);
    console.log('height:' + height);
   win.setPosition(0,0)
    //  获取鼠标的绝对坐标值
    console.log('x：' + electron.screen.getCursorScreenPoint().x)
    console.log('y：' + electron.screen.getCursorScreenPoint().y)
    console.log('菜单栏高度：' + electron.screen.getMenuBarHeight()) // Mac OS X
}
```
##任务栏的进度条
通过 BrowserWindow.setProgressBar 方法可以在状态栏的应用程序图标上设置进度条，这个功能仅限于Windows，代码如下：
```javascript
const remote = require('electron').remote;
function onClick_Test() {
    const win = remote.getCurrentWindow();
    win.setProgressBar(0.5)
}
```
##创建菜单
Electron 桌面应用支持三种菜单：**应用菜单**、**上下文菜单**及**托盘菜单**。

在 Electron 中，可以使用模板，也可以使用菜单对象来创建应用菜单。

应用菜单模板就是一个对象数组，每一个数据元素就是一个菜单项，可以通过数组中的对象设置这个菜单项的菜单文本及其他的属性，如菜单的子菜单。

下面就是一个典型的菜单模板的例子
```javascript
const template = [{
    label: '文件',   //设置菜单项文本
    submenu: [    //设置子菜单
        {
            label: '关于',
            role: 'about',       // 设置菜单角色（关于），只针对 Mac  OS X 系统
            click: ()=>{     //设置单击菜单项的动作（弹出一个新的模态窗口）
                var aboutWin = new BrowserWindow({width:300,height:200,parent:win,modal: true});
                aboutWin.loadFile('https://www.baidu.com');}
        },
        {
            type: 'separator'       //设置菜单的类型是分隔栏
        },
        {
            label: '关闭',
            accelerator: 'Command+Q',      //设置菜单的热键
            click: ()=>{win.close()}
        }
    ]
},
    {
        label: '编辑',
        submenu: [
            {
                label: '复制',
                click: ()=>{win.webContents.insertText('复制')}

            },
            {
                label: '剪切',
                click: ()=>{win.webContents.insertText('剪切')}

            },
            {
                type: 'separator'
            },
            {
                label: '查找',
                accelerator: 'Command+F',
                click: ()=>{win.webContents.insertText('查找')}
            },
            {
                label: '替换',
                accelerator: 'Command+R',
                click: ()=>{win.webContents.insertText('替换')}
            }
        ]
    }
];
```
创建应用菜单需要 Menu 类，因此现在来编写使用菜单模板的代码：
```javascript
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu  = electron.Menu;

function createWindow () {

    win = new BrowserWindow({file: 'index.html'});

    win.loadFile('./index.html');
    const template = ... //  定义菜单模板
    //  创建菜单对象
    const menu = Menu.buildFromTemplate(template);
    //  安装应用
    Menu.setApplicationMenu(menu);

    win.on('closed', () => {
      console.log('closed');

      win = null;
    })

  }

app.on('ready', createWindow)

app.on('activate', () => {

    if (win === null) {
        createWindow();
    }
})
```
###菜单项的角色（role）
菜单项的角色就是菜单的预定义动作，通过菜单对象的 role 属性设置，通用的角色如下：

- undo
- redo
- cut
- copy
- paste
- pasteAndMatchStyle
- selectAll
- delete
- minimize，最小化当前窗口
- close，关闭当前窗
- quit，退出应用程序
- reload，重新装载当前窗口
- forceReload，重新装载当前窗口（不考虑缓存）
- toggleDevTools，在当前窗口显示开发者工具
- toggleFullScreen，全屏显示当前窗口
- resetZoom，重新设置当前页面的尺寸为最初的尺寸
- zoomIn，将当前页面放大 10%
- zoomOut，将当前页面缩小 10%
- editMenu，整个“Edit”菜单，包括 Undo、Copy 等
- windowMenu，整个“Window”菜单，包括 Minimize、Close 等

```javascript
{
    label: '撤销',
    role:'undo'
}
```
###菜单项的类型（type）
菜单项的类型通过 type 属性设置，该属性可以设置的值及其含义如下。

- normal：默认菜单项
- separator：菜单项分隔条
- submenu：子菜单
- checkbox：多选菜单项
- radio：单选菜单项

###为菜单项添加图标
通过设置菜单项的 icon 属性，可以为菜单项添加图标（显示在菜单项文字的前方）。在 Windows 中，建议使用 ico 图标文件，在 Mac OS X 和 Linux 下，一般使用 png 图像。菜单项图标的标准尺寸是 16 × 16，图标尺寸太大时，Electron 是不会压缩图像尺寸的，图标都会按原始尺寸显示。
```javascript
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu  = electron.Menu;
function createWindow () {
    win = new BrowserWindow({file: 'index.html'});
    win.loadFile('./index.html');
    var icon = '';
    //  如果不是 Windows，使用 png 格式的图像
    if (process.platform != 'win32') {
        icon  = '../../../images/open.png';
    } else {  //  如果是 Windows，使用 ico 格式的图像
        icon = '../../../images/folder.ico';
    }
    const template = [
        {
            label: '文件',
            submenu: [
                {
                    label: '打开',
                    icon:icon  //  设置“打开”菜单项的图标
                },
                {
                    label: '重做',
                    role:'redo'
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    win.on('closed', () => {
      console.log('closed');
      win = null;
    })

  }

app.on('ready', createWindow)

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
})
```
###动态创建菜单
动态添加菜单项的基本原理就是创建若各个 MenuItem 对象，每一个 MenuItem 对象相当于一个菜单项，然后将 MenuItem 对象逐个添加到 Menu 对象中，Menu 对象相当于带子菜单的菜单项。

index.html
```html
<!DOCTYPE html>
<html>
<head>
    <!--  指定页面编码格式  -->
    <meta charset="UTF-8">
    <!--  指定页头信息 -->
    <title>动态添加菜单</title>
    <script src="event.js"></script>
</head>
<body>
    <h1>动态添加菜单</h1>
    <button onclick="onClick_AllOriginMenu()">添加最初的菜单</button>
    菜单文本：<input id="menuitem"/>
    <p><input id="radio" name="radio" type="radio"/> 单选<br><input id="checkbox" name="radio" type="radio"/> 多选</p>
    <button onclick="onClick_AddMenuItem()">动态添加菜单项目</button>
</body>
</html>
```

event.js
```javascript
const electron = require('electron');
const app = electron.app;
const remote = electron.remote;
const BrowserWindow = remote.BrowserWindow;
const Menu  = remote.Menu;
const MenuItem  = remote.MenuItem;
function saveClick() {
   // 单击“保存”按钮后弹出一个窗口
    var win = new BrowserWindow({width:300,height:200});
    win.loadURL('https://geekori.com');
}
// 
var customMenu = new Menu();
//  添加最初的应用菜单
function onClick_AllOriginMenu() {

    const menu = new Menu();
    var icon = '';
    if (process.platform != 'win32') {
        icon  = '../../../images/open.png';
    } else {
        icon = '../../../images/folder.ico';
    }
   //  创建菜单项对应的 MenuItem 对象
    var menuitemOpen =    new MenuItem({label:'打开',icon:icon})
    var menuitemSave = new MenuItem({label:'保存',click:saveClick})
   // 创建带子菜单的菜单项
    var menuitemFile = new MenuItem({label:'文件',submenu:[menuitemOpen,menuitemSave]});
   // 创建用于定制的菜单项目
    menuitemCustom =  new MenuItem({label:'定制菜单',submenu:customMenu});

    menu.append(menuitemFile);
    menu.append(menuitemCustom);

    Menu.setApplicationMenu(menu);

}
//  动态添加菜单项
function onClick_AddMenuItem() {
    var type = 'normal';
    if(radio.checked)  {
        type = 'radio';      // 设为单选风格的菜单项
    }
    if(checkbox.checked)  {
        type  =  'checkbox';  //  设为多选风格的菜单项
    }
   //  动态添加菜单项
    customMenu.append(new MenuItem({label:menuitem.value,type:type}))
    menuitem.value = '';
    radio.checked = false;
    checkbox.checked=false;
   //  必须更新菜单，修改才能生效
    Menu.setApplicationMenu(Menu.getApplicationMenu());
}
```
###上下文菜单
创建上下文菜单的方式与创建应用菜单的方式类似，只是不使用 Menu.setApplicationMenu 方法将菜单作为应用菜单显示，而是使用 menu.popup 方法在鼠标单击的位置弹出菜单

index.html
```html
<!DOCTYPE html>
<html>
<head>
    <!--  指定页面编码格式  -->
    <meta charset="UTF-8">
    <!--  指定页头信息 -->
    <title>上下文菜单</title>
    <script src="event.js"></script>
</head>
<body onload="onload()">
    <h1>上下文菜单</h1>
    <div id = "panel" style="background-color: brown; width: 300px;height:200px"></div>
</body>
</html>
```

event.js
```javascript
const electron = require('electron');
const app = electron.app;
const remote = electron.remote;
const BrowserWindow = remote.BrowserWindow;
const Menu  = remote.Menu;
const MenuItem  = remote.MenuItem;
const dialog = remote.dialog;
function  onload() {
    const menu = new Menu();
    var icon = '';
    if (process.platform != 'win32') {
        icon  = '../../../images/open.png';
    } else {
        icon = '../../../images/folder.ico';
    }
    const win = remote.getCurrentWindow();
    //  添加上下文菜单项，单击菜单项，会弹出打开对话框，并将选择的文件路径设置为窗口标题
    var menuitemOpen = new MenuItem({label:'打开',icon:icon,click:()=>{
        var paths =  dialog.showOpenDialog({properties: ['openFile']});
        if(paths  != undefined)
            win.setTitle(paths[0]);
    }});
    var menuitemSave = new MenuItem({label:'保存',click:saveClick})

    var menuitemFile = new MenuItem({label:'文件',submenu:[menuitemOpen,menuitemSave]});

    var menuitemInsertImage =  new MenuItem({label:'插入图像'});
    var menuitemRemoveImage =  new MenuItem({label:'删除图像'});

    menu.append(menuitemFile);
    menu.append(menuitemInsertImage);
    menu.append(menuitemRemoveImage);
   //  添加上下文菜单响应事件，只有单击鼠标右键，才会触发该事件
    panel.addEventListener('contextmenu',function(event) {
        //  阻止事件的默认行为，例如，submit 按钮将不会向 form 提交
       event.preventDefault();
       x = event.x;
       y = event.y;
       //  弹出上下文菜单
       menu.popup({x:x,y:y});
       return false;
    });
}
```
##创建托盘应用
托盘应用需要设置托盘的图标，以及左击或右击图标时显示的上下文菜单等。

一个托盘图标由一个 Tray 对象表示，因此为应用程序添加托盘图标，首先要先创建一个 Tray 对象。注意，Tray 对象不需要像菜单一样通过特定的方法添加到托盘上，只要创建一个 Tray 对象就会自动将图标放到托盘上，如果在一个应用程序中创建多个 Tray 对象，那么就会在托盘中添加多个图标。
```javascript
const {app, Menu, Tray,BrowserWindow} = require('electron')
let tray;
let contextMenu;
function createWindow () {
    win = new BrowserWindow({file: 'index.html'});
    win.loadFile('./index.html');
    //  创建 Tray 对象，并指定托盘图标
    tray = new Tray('../../../../images/open.png');
    //  创建用于托盘图标的上下文菜单
    contextMenu = Menu.buildFromTemplate([
        {label: '复制', role:'copy'},
        {label: '粘贴', role:'paste'},
        {label: '剪切', role:'cut'}
    ])
    //  设置托盘图标的提示文本
    tray.setToolTip('这是第一个托盘应用')
    //  将托盘图标与上下文菜单关联
    tray.setContextMenu(contextMenu)
    win.on('closed', () => {
        win = null;
    })
}

app.on('ready', createWindow)
app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
})
```
> 系统并不会压缩托盘图标的尺寸，因此在设置托盘图标时，应该选择适当尺寸的图像文件，通常是16 × 16 大小。

为托盘图标设置上下文菜单：
```javascript
contextMenu = Menu.buildFromTemplate([
    {label: '复制', role:'copy'},
    {label: '粘贴', role:'paste'},
    {label: '剪切', role:'cut'},
    {label: '关闭', role:'close',click:()=>{win.close()}}
])
```
Mac OS X 默认是单击鼠标左键弹出上下文菜单，在 Windows 是单击鼠标右键弹出上下文菜单，不过这个默认行为可以通过托盘事件修改。

Tray 有一个 right-click 事件，该事件在鼠标右键单击托盘图标时触发，可以在该事件中调用 popUpContextMenu 方法弹出上下文菜单，代码如下：
```javascript
tray.on('right-click', (event) =>{
    tray.popUpContextMenu(contextMenu);
});
```
下面的代码演示了 Tray 中主要事件的使用方法：
```javascript
const remote= require('electron').remote;
const Menu =  remote.Menu;
const Tray = remote.Tray;
let tray;
let contextMenu
//  添加托盘图标
function onClick_AddTray()  {
    if(tray != undefined) {
        return
    }
    tray = new Tray('../../../../images/open.png');
    var win = remote.getCurrentWindow();
    contextMenu = Menu.buildFromTemplate([
        {label: '复制', role:'copy'},
        {label: '粘贴', role:'paste'},
        {label: '剪切', role:'cut'},
        {label: '关闭', role:'close',click:()=>{win.close()}}

    ])
   /*
    为托盘图标添加鼠标右键单击事件，在该事件中，如果按住 shift 键，再单击鼠标右键，会弹出一个窗口，否则会弹出上下文菜单。

    如果为托盘图标绑定了上下文菜单，在 Windows 下不会响应该事件，这是因为 Windows 下是单击鼠标右键显示上下文菜单的，正好和这个 right-click 事件冲突。

    event 参数包括下面的属性，表明当前是否按了对应的键。
    1. altKey：Alt 键
    2. shiftKey：Shift 键
    3. ctrlKey：Ctrl 键
    4. metaKey：Meta 键，在 Mac OS X 下是 Command 键，在 Windows 下是窗口键（开始菜单键）
   */
    tray.on('right-click', (event) =>{
        textarea.value += '\r\n' + 'right-click';
        if(event.shiftKey) {
            window.open('https://www.baidu.com','right-click','width=300,height=200')
        } else  {
            //  单击鼠标右键弹出上下文菜单
            tray.popUpContextMenu(contextMenu);
        }
    });
   /*
    为托盘图标添加鼠标单击事件，在该事件中，如果按住 shift 键，再单击鼠标左键或右键，会弹出一个窗口，否则会弹出上下文菜单。
    如果将上下文菜单与托盘图标绑定，在 Mac OS X 下，单击鼠标左键不会触发该事件，这是由于 Mac OS X 下是单击鼠标左键弹出上下文菜单，与这个事件冲突
   */
    tray.on('click', (event) =>{
        textarea.value += '\r\n' + 'click';
        if(event.shiftKey) {
            window.open('https://www.baidu.com','click','width=300,height=200')
        } else  {
            //  单击鼠标右键弹出上下文菜单
            tray.popUpContextMenu(contextMenu);
        }
    });
   /*
    当任何东西拖动到托盘图标上时触发，读者可以从 word 中拖动文本到托盘图标上观察效果
    Only Mac OS X
    */
    tray.on('drop',()=>{
        textarea.value += '\r\n' + 'drop';

    });
   /*
    当文件拖动到托盘图标上时会触发，files 参数是 String 类型数组，表示拖动到托盘图标上的文件名列表
    Only Mac OS X
    */
    tray.on('drop-files',(event,files)=>{
        textarea.value += '\r\n' + 'drop-files';
        //  输出所有拖动到托盘图标上的文件路径
        for(var i = 0; i < files.length;i++) {
            textarea.value += files[i] + '\r\n';
        }
    });
   /*
    当文本拖动到托盘图标上时会触发，text 参数是 String 类型，表示拖动到托盘图标上的文本
    Only Mac OS X
    */
    tray.on('drop-files',(event,files)=>{
        textarea.value += '\r\n' + 'drop-files';
        for(var i = 0; i < files.length;i++) {
            textarea.value += files[i] + '\r\n';
        }
    });    
    tray.setToolTip('托盘事件')
    tray.setContextMenu(contextMenu)
}
```
Tray 类提供了多个方法用来控制托盘图标，如设置托盘图标、设置托盘文本、移除托盘图标等：
```javascript
//  设置托盘图像
function  onClick_SetImage() {
    if(tray != undefined) {
        tray.setImage('../../../../images/note1.png')
    }
}
//  设置托盘标题（仅适用于Mac OS X）
function onClick_SetTitle() {
    if(tray != undefined) {
        tray.setTitle('hello world')
    }
}
//  设置托盘按下显示的图标（仅适用于Mac OS X）
function onClick_SetPressedImage() {
    if(tray != undefined) {
        tray.setPressedImage('../../../../images/open.png')
    }
}
//  设置托盘提示文本
function onClick_SetTooltip() {
    if(tray != undefined) {
        tray.setToolTip('This is a tray')
    }
}
//  移除托盘
function onClick_RemoveTray()  {
    if(tray != undefined) {
        tray.destroy();
        tray = undefined;   //  应该将tray设为undefined，否则无法再创建托盘对象
    }
}
```
###显示气泡信息
仅Windows

```javascript
const remote= require('electron').remote;
const Menu =  remote.Menu;
const Tray = remote.Tray;
var tray;
var contextMenu;

function onClick_AddTray()  {
    if(tray != undefined  ) {
        return
    }
    tray = new Tray('../../../../images/open.png');
    var win = remote.getCurrentWindow();
    contextMenu = Menu.buildFromTemplate([
        {label: '复制', role:'copy'},
        {label: '粘贴', role:'paste'},
        {label: '剪切', role:'cut'},
        {label: '关闭', role:'close',click:()=>{win.close()}}
    ])
   //  添加气泡消息显示事件
    tray.on('balloon-show',()=>{
        log.value += 'balloon-show\r\n';
    });
    //  添加气泡消息单击事件
    tray.on('balloon-click',()=>{
        log.value += 'balloon-click\r\n';
    });
    //  添加气泡消息关闭事件
    tray.on('balloon-closed',()=>{
        log.value += 'balloon-closed\r\n';
    });
    tray.setToolTip('托盘事件')
    tray.setContextMenu(contextMenu)
}
function onClick_DisplayBalloon() {
    if(tray != undefined) {
        //  显示气泡消息
        tray.displayBalloon({title:'有消息了',icon:'../../../../images/note.png',content:'软件有更新了，\r\n赶快下载啊'})
    }
}
```
气泡消息包含如下 3 个事件：

- balloon-show，当气泡消息显示时触发；
- balloon-click，当单击气泡消息时触发；
- balloon-closed，当气泡消息关闭时触发。

其中 balloon-click 和 balloon-closed 是互斥的，也就是说，单击气泡消息后，气泡消息会立刻关闭，在这种情况下，并不会触发 balloon-closed 事件。因此 balloon-closed 事件只有当气泡消息自己关闭后才会触发，气泡消息在显示几秒后会自动关闭。