#Electron学习（三）

##数据存储
electron数据存储有多种方式，其中最简单的就是使用最基础的Web API：localStorage

index.html
```html
<html>
    <head>
        <title>笔记本</title>
        <link rel="stylesheet" type="text/css" href="index.css">
        <script src="event.js"></script>
    </head>
    <body>
        <div id="close" onclick="quit();">x</div>
        <textarea id="textarea" onKeyUp="saveNotes();"></textarea>
    </body>
</html>
```

index.css
```css
body {
    background: #E1FFFF;
    color: #694921;
    padding: 1em;
}

textarea {
    font-family: 'Hannotate SC', 'Hanzipen SC','Comic Sans', 'Comic Sans MS';
    outline: none;
    font-size: 18pt;
    border: none;
    width: 100%;
    height: 100%;
    background: none;
}

#close {
    cursor: pointer;
    position: absolute;
    top: 8px;
    right: 10px;
    text-align: center;
    font-family: 'Helvetica Neue', 'Arial';
    font-weight: 400;
}
```

event.js
```javascript
const electron = require('electron');
const app = electron.remote.app;
//初始化页面
function initialize () {
        //从 localStorage 中获取保存的笔记
    let notes = window.localStorage.notes;
    if (!notes) notes = '记录生活的点点滴滴...';
       //将保存的笔记显示在文本输入区域
       textarea.value = notes;
}
function saveNotes () {
    let notes = textarea.value;
        //保存输入的笔记
    window.localStorage.setItem('notes',notes);
}
//退出笔记本
function quit () { app.quit(); }
window.onload = initialize;
```
尽管 Electron 应用可以利用 localStorage API 将数据以键值的形式保存在客户端，但 localStorage 并不适合存储大量的数据，而且 localStorage 是通过键值存储数据的，比较适合保存配置信息，而不是海量的结构化数据，如二维表。

因此，要想在 Electron 客户端保存更复杂的数据而且便于检索，就需要使用真正的数据库，如 SQLite、MySQL。
###SQLite 数据库
SQLite数据库是本地数据库，会直接在本地生成`.db`文件。

SQLite 支持多种接口，如 Java、C++、C、Python、JavaScript 等，Node.js 也支持多种方式操作 SQLite 数据库，其中最简单的就是使用 sql.js。
```javascript
let sql = require('./sql.js');
let db = new sql.Database();
```
接下来可以使用 run 方法执行 SQL 语句，代码如下
```javascript
let sql = ...
db.run(sql)
```
run 方法可以执行多种 SQL 语句，如创建表、插入、更新、删除等；如果要查询记录，可以使用 exec 方法，代码如下：
```javascript
let rows = db.exec("select * from table1");
```
要注意的是，前面的所有操作都是在内存中完成的，到现在为止，还没有将 SQLite 数据库保存在硬盘中，因此在执行创建表、插入、更新、删除等任何修改数据的操作后，应该使用下面的代码将内存中的数据库作为文件保存在硬盘中。
```javascript
//获取 SQLite 数据库的二进制数据
var binaryArray = db.export();
var fs = require('fs');
fs.writeFile("test.db", binaryArray, "binary", function (err) {
       ... ...
});
```
###MySQL数据库
在 Node.js 中访问 MySQL 数据库需要使用 mysql 模块，该模块不是 Node.js 的标准模块，因此需要在 Electron 工程根目录执行下面的命令安装。
```
npm install --save mysql
```
首先用下面的代码导入 mysql 模块。
```javascript
const mysql = require('mysql');
```
然后使用下面的代码连接 MySQL 数据库。
```javascript
conn = mysql.createConnection({
    host: MySQL服务器的IP或域名,
    user: 用户名,
    password: 密码,
    database: 数据库名,
    port: 3306   //MySQL 的默认端口号
});
```
接下来可以使用 conn.query 方法执行 SQL 语句。
```javascript
let updateSQL = ...
conn.query(updateSQL, function (err, result) {
    if (err) console.log(err);
    else {
        console.log('success!');
    }
});
```
##打包和发布应用
electron-packager 是一款非常强大的 Electron 应用打包工具，是开源免费的。

使用下面的命令将 electron-packager 安装到当前工程中：
```
npm install electron-packager --save-dev
```
或者使用下面的命令全局安装 electron-packager。
```
npm install electron-packager -g
```
electron-packager 支持如下两种使用方式：

- 命令行
- API

###命令行使用
在项目根目录下进入命令行：
```
electron-packager . --electron-version=3.0.2
```
其中 electron-packager 命令后面的点（.）表示要打包当前目录的工程，后面的 --electron-version 命令行参数表示要打包的 Electron 版本号，注意，这个版本号不是本地安装的 electron 版本号，而是打包到安装包中的 electron 版本，但建议打包的 Electron 版本尽量与开发中使用的 Electron 版本相同，否则容易出现代码不兼容的问题。

在打包的过程中，electron-packager 会下载指定的 Electron 安装包。

但这样打包出来的应用，其中的图片等资源是显示不出来的（只针对资源不在项目目录下的）。

解决方法一种是直接手动把资源复制到指定的目录下；一种是在打包之前就把资源移动到项目目录下；还有一种就是直接使用网络资源。
####修改应用程序图标
只需要找一个 ico 文件，并使用下面的命令打包即可
```
electron-packager .  me  --icon=D:\MyStudio\resources\electron\images\folder.ico  --electron-version=3.0.2
```
###使用 electron-packager-interactive
使用 electron-packager 工具打包需要指定多个命令行参数，比较麻烦，为了方便，可以使用 electron-packager 交互工具 electron-packager-interactive，这个程序也是一个命令行工具，执行 electron-packager-interactive 后，会在控制台一步一步提示该如何去做。

使用下面的命令安装 electron-packager-interactive。
```
npm install  electron-packager-interactive -g
```
执行 electron-packager-interactive 命令，会一步一步提示应该如何做，如果要保留默认值，直接按 Enter 键即可，如果需要修改默认值，直接在控制台输入新的值即可。