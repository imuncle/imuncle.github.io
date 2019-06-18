# 大叔的个人小站
这里是`大叔的个人小站`，我会不定期在这里更新我的学习心得，以及相关教程。

本小站目前有以下板块：

- [机器学习](https://imuncle.github.io/issue_per_label.html?label=AI)
- [小项目](https://imuncle.github.io/issue_per_label.html?label=Project)
- [web技术](https://imuncle.github.io/issue_per_label.html?label=web)
- [RM比赛](https://imuncle.github.io/issue_per_label.html?label=RM)
- [ROS开发](https://imuncle.github.io/issue_per_label.html?label=ROS)
- [工具](https://imuncle.github.io/issue_per_label.html?label=tools)
- [其他](https://imuncle.github.io/issue_per_label.html?label=other)

小站网址[https://imuncle.github.io](https://imuncle.github.io)

## 小站架构
本站基于GitHub的issue系统搭建，评论功能参考了开源项目[Gitment](https://github.com/imsun/gitment)，借用了该项目的css样式。

文章浏览功能参考GitHub API自己写了一个，发布文章直接在GitHub issue界面进行。

整个博客架构非常简单，核心内容只有三个HTML文件和一个JavaScript文件。

```
index.html
content.html
issue_per_label.html
+ css
|__bootstrap.min.css
|__common.css
|__gitment.css
|__home.css
+ js
|__jquery.min.js
|__typed.js
|__gitblog.js
```

~~后续打算把该博客模板整理出来，单独建个repository。~~

已经开源出来了，详见[gitblog](https://github.com/imuncle/gitblog)。