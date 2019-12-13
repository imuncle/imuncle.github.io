# 大叔的个人小站
这里是`大叔的个人小站`，我会不定期在这里更新我的学习心得，以及相关教程。

本小站目前有以下板块：

- [机器学习](https://imuncle.github.io/issue_per_label.html?label=AI)
- [小项目](https://imuncle.github.io/issue_per_label.html?label=Project)
- [web技术](https://imuncle.github.io/issue_per_label.html?label=web)
- [RM比赛](https://imuncle.github.io/issue_per_label.html?label=RM)
- [ROS开发](https://imuncle.github.io/issue_per_label.html?label=ROS)
- [工具](https://imuncle.github.io/issue_per_label.html?label=tools)
- [灵感想法](https://imuncle.github.io/timeline)
- [其他](https://imuncle.github.io/issue_per_label.html?label=other)

小站网址：[https://imuncle.github.io](https://imuncle.github.io)

## 小站架构
本站基于GitHub的issue系统搭建，评论功能参考了开源项目[Gitment](https://github.com/imsun/gitment)，借用了该项目的css样式。

文章浏览功能参考GitHub API自己写了一个，发布文章直接在GitHub issue界面进行。

整个博客架构非常简单，核心内容只有四个HTML文件和一个JavaScript文件（gitblog.js），另外我添加了live2d模型。

```bash
imuncle.github.io
├── index.html                  # 小站主页
├── content.html                # 文章详情页
├── issue_per_label.html        # 文章列表页
├── 404.html                    # Not Found
├── api.html                    # api接口
├── example.html                # 详情参考 https://imuncle.github.io/content.html?id=55
├── config.json                 # 小站配置文件
├── css
│   ├── bootstrap.min.css
│   ├── common.css
│   ├── gitment.css
│   └── home.css
├── image                       # 文章里用到的图片
├── js 
│   ├── jquery.min.js
│   ├── typed.js                # 实现首页动态打字效果
│   ├── gitblog.js              # 小站核心程序
│   ├── live2d.js               # Live2d驱动程序
│   └── LAppDefine.js           # Live2d配置文件
├── model/22                    # Live2d模型
├── README.md
```

小站架构已开源，可用于自己搭建博客，详见[gitblog](https://github.com/imuncle/gitblog)。求各位大佬点个Star~

> gitblog中没有集成live2d模型，但可参考我的另一个[live2d](https://github.com/imuncle/live2d)仓库