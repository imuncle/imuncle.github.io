#Markdown输入数学符号
2019-01-18

---
##上下标
```markdown
x^{y^z} = (1+e^x)^{-2xy^w}
```
$$x^{y^z} = (1+e^x)^{-2xy^w}$$

##括号
`()`和`[]`直接写就行，而`{}`则需要转义。
```markdown
f(x, y) = x^2 + y^2, x \epsilon [0, 100], y \epsilon \{3, 4, 5\}
```

$$f(x, y) = x^2 + y^2, x \epsilon [0, 100], y \epsilon \{3, 4, 5\}$$

使用大括号的时候，需要使用`\left`和`\right`加大括号的大小。
```markdown
(\frac {x} {y})^2 , \left(\frac {x} {y} \right)^2
```

$$(\frac {x} {y})^2 , \left(\frac {x} {y} \right)^2$$

`\left`和`\right`必须成对出现，对于不显示的一边可以使用`.`代替
```markdown
\left. \frac{du}{dx} \right| _{x=0}
```

$$\left. \frac{du}{dx} \right| _{x=0}$$

##分数
使用`\frac{分子}{分母}`，或者使用`分子\over 分母`
```markdown
\frac{1}{2x+1} , {{1} \over {2x+1}}
```

$$\frac{1}{2x+1} , {{1} \over {2x+1}}$$

##开方
使用`\sqrt{a}`
```markdown
\sqrt{16}
```

$$\sqrt{16} $$

##省略号
有两种省略号，`\ldots`表示语文本底线对其的省略号，`\cdots`表示与文本中线对其的省略号，`\cdot`表示一个点，也就是点乘号
```markdown
f(x_1,x_2,\ldots,x_n) = x_1^2+x_2^2+\cdots+x_n^2
```
$$f(x_1,x_2,\ldots,x_n) = x_1^2+x_2^2+\cdots+x_n^2$$

##向量
使用`\vec{a}`
```markdown
\vec a \cdot \vec b = 0
```
$$\vec a \cdot \vec b = 0$$

##积分
```markdown
\int_0^1x^2dx
```
$$\int_0^1x^2dx$$

##极限
```markdown
\lim_{n\rightarrow+\infty}\frac{1}{n(n+1)}
```
$$\lim_{n\rightarrow+\infty}\frac{1}{n(n+1)}$$

##累加/累乘
```markdown
\sum_1^n\frac{1}{x^2}, \prod_{i=0}^n{1 \over {x^2}}
```
$$\sum_1^n\frac{1}{x^2}, \prod_{i=0}^n{1 \over {x^2}}$$

##希腊字母
```markdown
\alpha \beta \gamma \Gamma \delta \Delta \epsilon \varepsilon \zeta \eta \theta \Theta \vartheta \iota \kappa \lambda \Lambda \mu \nu \xi \Xi \pi \Pi \varpi \rho \varrho \sigma \Sigma \varsigma \tau \upsilon \Upsilon \phi \Phi \varphi \chi \psi \Psi \Omega \omega
```
$$\alpha \beta \gamma \Gamma \delta \Delta \epsilon \varepsilon \zeta \eta \theta \Theta \vartheta \iota \kappa \lambda \Lambda \mu \nu \xi \Xi \pi \Pi \varpi \rho \varrho \sigma \Sigma \varsigma \tau \upsilon \Upsilon \phi \Phi \varphi \chi \psi \Psi \Omega \omega$$

##需要转义的字符
```markdown
\$ \%\&\_\{\}
```
$$\$ \%\&\_\{\}$$

##普通符号
```markdown
\pm \times \div \mid
```
$$\pm \times \div \mid$$

```markdown
\cdot \circ \ast \bigodot \bigotimes \leq 
 \geq \neq \approx \equiv \sum \prod \coprod
```
$$\cdot \circ \ast \bigodot \bigotimes \leq  \geq \neq \approx \equiv \sum \prod \coprod$$

##集合运算
```markdown
\emptyset \in \notin \subset \supset \subseteq \supseteq \bigcap \bigcup \bigvee \bigwedge \biguplus \bigsqcup
```
$$\emptyset \in \notin \subset \supset \subseteq \supseteq \bigcap \bigcup \bigvee \bigwedge \biguplus \bigsqcup$$

##对数运算
```markdown
\log \lg \ln
```
$$\log \lg \ln$$

##三角运算
```markdown
\bot \angle 30^\circ \sin \cos \tan \cot \sec \csc
```
$$\bot \angle 30^\circ \sin \cos \tan \cot \sec \csc$$

##微积分运算
```markdown
y{\prime}x \int \iint \iiint \oint \lim \infty \nabla
```
$$y{\prime}x \int \iint \iiint \oint \lim \infty \nabla$$

##逻辑运算
```markdown
\because \therefore \forall \exists
```
$$\because \therefore \forall \exists$$

##箭头
```markdown
\uparrow \downarrow \leftarrow \rightarrow \Uparrow \Downarrow \Leftarrow \Rightarrow \longleftarrow \longrightarrow \Longleftarrow \Longrightarrow
```
$$\uparrow \downarrow \leftarrow \rightarrow \Uparrow \Downarrow \Leftarrow \Rightarrow \longleftarrow \longrightarrow \Longleftarrow \Longrightarrow$$

##连线
```markdown
\overline{a+b+c+d}

\hat{y} \check{y} \breve{y}
```

$$\overline{a+b+c+d}$$

$$\hat{y} \check{y} \breve{y}$$

参考文章：[https://blog.csdn.net/xingxinmanong/article/details/78528791](https://blog.csdn.net/xingxinmanong/article/details/78528791)