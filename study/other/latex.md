#LaTeX学习
明天开始美赛就开始了，终于下决心走出摸鱼的状态。首先学学LaTeX好了。

##LaTeX命令
latex命令以反斜线 \ 开头

latex命令是**对大小写敏感**的。字母形式的LaTeX命令忽略其后的所有空格。如果要认为引入空格，需要在命令后面加一对括号阻止其忽略空格。
```
Shall we call ourselves \Tex\ users

or \Tex{} users?
```

大多数的LaTeX命令是带一个或多个参数，每个参数用花括号包裹。有些命令带一个或多个可选参数，以方括号包裹。还有些命令在命令名称后可以带一个星号*

LaTeX引入了环境的用法，用以令一些效果在局部生效，或是生成特定的文档元素。
```
\begin{<environment name>}{<arguments>}
...
\end{<environment name>}
```
环境允许嵌套使用。

LaTeX源代码以一个`\documentclass`命令作为开头，它规定了文档使用的文档类，紧接着我们可以用`\usepackage`命令调用宏包。再接着，我们需要用``\begin{document}`和`\end{document}`来标记正文内容的开始位置和结束位置，而将正文内容写入其中。
```
\documentclass{...}
/* 这里是导言区，除调用宏包外，一些对文档的全局设置命令也在这里使用 */
\usepackage{...}
\begin{document}

\end{document}
```
##用命令行操作LaTeX
```
\documentclass{article}
\begin{document}
‘‘Hello world!’’ from \LaTeX.
\end{document}
```
保存为`helloworld.tex`，然后打开命令行，执行下列语句：
```
latex helloworld.tex //后缀可选，这句话会生成helloworld.dvi
dvipdfmx helloworld.dvi //把dvi文件转为pdf

pdflatex helloworld.tex
xelatex helloworld.tex
```
##文档类
```
\document[<options>]{<class-name>}
```
class-name：`article`，`report`，`book`等。

可选参数`options`为文档类指定选项，以全局地影响文档布局的参数，如字号、纸张大小，单双面等等。比如调用`article`文档类排版文章，指定纸张为A4大小，基本字号为11pt，双面排版：
```
\documentclass[11pt, twoside, a4paper]{article}
```
##文件的组织方式
当编写较大规模的LaTeX源代码，如书籍、毕业论文等，你有理由将源代码分成若干个文件，比如很自然地每章写一个文件。LaTeX提供了命令`\include{<filename>}`用来在源代码里插入文件。

文件名必要时需要加上相对或绝对路径，文件名不带扩展名的时候默认为`/tex`。

值得注意的是`\include`在读入<filename>之前会另起一页，有时候我们并不需要这样，而是用`\input`命令。

另外LaTeX提供了一个`\includeonly`来组织文件，用于**导言区**，指定只载入某些文件。

最后介绍一个使用的工具宏包syntonly。加载这个宏包后，在导言区使用`\syntaxonly`命令，可令LaTeX编译后不生成 DVI 或者 PDF 文档，只排查错误，编译速度会快不少。
```
\usepackage{syntonly}
\syntaxonly
```
#用LaTeX排版文字
##排版中文
xeCJK宏包
```
\documentclass{article}
\usepackage{xeCJK}
\setCJKmainfont{SimSun}
\begin{document}
中文LaTeX排版。
\end{document}
```
ctex 宏包和文档类是对 CJK 和 xeCJK 等宏包的进一步封装。 ctex 文档类包括 ctexart /ctexrep / ctexbook，是对 LATEX 的三个标准文档类的封装，对 LATEX 的排版样式做了许多调整，以切合中文排版风格。最新版本的 ctex 宏包/文档类甚至支持自动配置字体。比如上述例子可进一步简化为：
```
\documentclass{ctexart}
\begin{document}
中文LaTeX排版。
\end{document}
```
##LaTeX中的字符
空格键、tab键被视为“空格”。连续的若干个空白字符视为一个空格。一行开头的空格忽略不计。

行末的回车视为一个空格；连续两个回车，也就是空行，会将文字分段。多个空行被视为一个空行。也可以在行末使用`\par`命令分段。

LaTeX使用`%`字符作为注释。

下列字符要以带饭斜杠线的形式输入：
```
# $ % & { } _ ^ ~ \
```
其中`\`只能用`\textbackslash`输入，因为`\\`被直接定义成了手动换行的命令。

LaTeX双引号用`''`和`''`输入。

LaTeX中有三种长度的“横线”可用：连字号、短破折号和长破折号。连字号永凯组成复合词；短破折号将数字连接表示范围；长破折号最为破折号使用。

```
X-rated\\
pages 13--67\\
yes---or no?
```

LaTeX提供了命令`\ldots`来生成省略号。`\ldots`和`\dots`是两个等效的命令。

**波浪号**
```
a\~{}z \qquad a$\sim$z
```
##文字强调
`\underline`命令给文字添加下划线
```
An \underline{underline} text.
```
但是这个命令比较傻逼，不同的单词可能生成高低各异的下划线，并且无法换行。ulem宏包解决了这一个问题，它提供的`\uline`命令能够轻松生成自动换行的下划线。
```
An example of \uline{some long and undeline words.}
```
`\emph`命令用来将文字变为斜体以示强调。如果在本身已经用该命令强调的文字内部嵌套使用`\emph`，内部则使用正常字体的文字。
#章节和目录
```
\chapter{<title>} 
\section{<title>}
\subsection{<title>} 
\subsubsection{<title>}
\paragraph{<title>} 
\subparagraph{<title>}
```
`\part`命令用以将整个文档分割为大的分块，但不影响`\chapter`或`\section`等的编号：

在LaTeX中生成目录非常容易，只需要在合适的地方使用命令：
```
\tableodcontents
```
所有标准文档类都提供了一个`\appendix`命令就昂正文和附录分开，使用之后，最高一级章节改为使用拉丁字母编号，从A开始。

book文档类还提供了前言、正文、后记结构的划分命令：

* \frontmatter 前言部分，页码为小写罗马字母格式；其后的 \chapter 不编号。
* \mainmatter 正文部分，页码为阿拉伯数字格式，从 1 开始计数；其后的章节编号正常。
* \backmatter 后记部分，页码格式不变，继续正常计数；其后的 \chapter 不编号。

以上三个命令还可以与`\appendix`命令结合，生成有前言、正文、附录、后记四部分的文档。
```
\documentclass[...]{book}
% 导言区，加载宏包和各项设置
\usepackage{...}
% 此处示意对参考文献和索引的设置
\usepackage{makeidx}
\makeindex
\bibliographystyle{...}
\begin{document}
\frontmatter
\maketitle % 标题页
\include{preface} % 前言章节 preface.tex
\tableofcontents
\mainmatter
\include{chapter1} % 第一章 chapter1.tex
\include{chapter2} % 第二章 chapter2.tex
...
\appendix
\include{appendixA} % 附录 A appendixA.tex
...
\backmatter
\include{prologue} % 后记 prologue.tex
\bibliography{...} % 利用 BibTeX 工具生成参考文献
\printindex % 利用 makeindex 工具生成索引
\end{document}
```
##交叉引用
交叉引用是LaTeX强大的自动排版功能的体现之一。在能够被交叉引用的地方，如章节、公式、图标、定理等位置使用`\label`命令：
```
\label{<label-name>}
```
之后可以在别处使用`\ref`或`\pageref`命令，分贝生成交叉引用的编号和页码：
```
A reference to this subsection \label{sec:this} looks like:‘‘see section~\ref{sec:this} on page~\pageref{sec:this}.’’
```
##脚注
使用`\footnote`命令可以在页面底部生成一个脚注：
```
“天地玄黄，宇宙洪荒。日月盈昃，辰宿列张。” \footnote{出自《千字文》。 }
```
##列表
LaTeX提供了基本的有序和无序列表环境enumerate和itemize，两者的用法都很类似，都用`\item`表明每个列表项。enumerate环境会自动对列表项编号。
```
\begin{enumerate}
  \item An item.
  \begin{enumerate}
    \item A nested item.
    \item[*] A starred item.
    \item Another item. \label{itref}
  \end{enumerate}
  \item Go back to upper level.
  \item Reference(\ref{itref}).
\end{enumerate}
```
`\item`可带一个可选参数，将有序列表的计数或者无序列表的符号替换成自定义的符号。

列表可以嵌套使用，最多嵌套四层。
##对齐
center、flushleft、flushright环境分别用于生成居中、左对齐和右对齐的文本环境。
```
\begin{center} . . . \end{center}
\begin{flushleft} . . . \end{flushleft}
\begin{flushright} . . . \end{flushright}
```
##代码环境
有时候我们需要将一段代码原样转义输出，这就要用到代码环境`verbatim`，带星号的版本将更进一步将空格显示成␣。
```
\begin{verbatim}
#include <iostream>
int main()
{
  std::cout << "Hello, world!"
            << std::endl;
  return 0;
}
\end{verbatim}
```
##表格
有点复杂啊。傻逼LaTeX
##图片
LaTeX本身不支持插图功能，需要由graphicx宏包辅助支持。在调用了这个宏包后，就可以使用`\includegraphics`命令加载图片了：
```
\includegraphics[<options>]{<filename>}
```
`\includegraphics`命令的可选参数支持<key>=<value>形式复制，常用的参数如下：

参数 | 含义
:--:|:--:
width|将图片缩放到宽度为width
height|将图片缩放到高度为height
scale|将图片相对于原尺寸缩放scale倍
angle|令图片逆时针旋转angle度

#排版数学公式
这方面的许多命令和环境依赖于`amsmath`宏包。数学公式有两种排版方式：其一是与文字混排，称为**行内公式**，其二是单独列为一行排列，称为**行间公式**。

行内公式由一对$符号包裹。

行间公式由`equation`环境包裹。该环境为公式自动生成一个编号，这个编号可以生成交叉引用。amsmath的`\eqref`命令甚至为引用自动加上圆括号。
```
Add $a$ squared and $b$ squared
to get $c$ squared
\begin{equation}
a^2 + b^2 = c^2
\end{equation}
Einstein says
\begin{equation}
E = mc^2 \label{clever}
\end{equation}
This is a reference to
\eqref{clever}.
```
在`\equation*`环境中可以取消公式的自动编号。

在数学模式中，输入的空格全部被忽略。数学符号的间隙默认完全由符号的性质决定。需要人为引入空隙时，使用`\quad`和`\qquad`等命令。

如果想在数学公式中输入正体的文文本，可以使用`\text`或`\mathrm`命令。

