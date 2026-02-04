前端时间学习 shader，过程理解它的数学曲线，发现 Desmos 没那么好用，就自己实现了一款图形工具。


[https://math-graph.yysuni.com/](https://math-graph.yysuni.com/)

## 功能

1. 正常的 **y = x**
2. 可叠加在 y = x 的基础上写** z = y + 1**
	* 这个逻辑是覆盖式的
3. 内置了多个**函数**，如 mix、smoothstep

## 演示

<iframe
	src='https://math-graph.yysuni.com/'
	style={{ border: 0 }}
	allowfullscreen
	width="100%"
	height="600px"
	loading='lazy'></iframe>