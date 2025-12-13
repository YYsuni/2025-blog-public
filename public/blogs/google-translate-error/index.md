
> Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.

在生产数据监控中，时常看到这条崩溃，如果常规去测试，找不出任何问题。

在网络上搜索，在 github 一条 issue 中找到线索：Google Translate.

大致原因是，当用户使用了 谷歌翻译，在进行一些交互时，部分页面会崩溃报错。直面上看，这应该跟文本替换导致的 React 更新异常。

## 分析

Google Translate 之后，每一个文本都会被替换为两层 `<font>` 包裹的译文。

> `<font>` 标签定义了该内容的字体大小、顏色与表现。按道理已经不推荐使用了。

```html
<font style="vertical-align: inherit;">
	<font style="vertical-align: inherit;">译文 </font>
</font>
```

为什么是两层？这个不清楚，但是测试主动给文字包裹一层 `<font>` 就会影响到外面的一层 `<font>`，但同时也会多出一组空的 `<font>`（需要是当前 `<font>` 前/后 还有文字，如果同级没有其它文本，就会正常一些）。

```html
Text1<font data-id="1">Text2</font>

// =>

<font style="vertical-align: inherit;">
	<font style="vertical-align: inherit;">译文1</font>
	<font data-id="1">
		<font style="vertical-align: inherit;">译文2</font>
	</font>
</font>
<font data-id="1">
	<font style="vertical-align: inherit;"></font>
</font>
```

### 崩溃分析

崩溃的发生点，在文本变量的拼接。如果 react 代码中，动态文本直接拼接的话，文本变化时，翻译后的页面会直接崩溃。

### 解决办法

基于以上原因，所以解决办法是避开动态文本的拼接。将动态文本都进行一次 `<span>` 包裹。
也不需要将所有 文本包裹，只需保证 静态文本 + 动态文本时，其中有一方是被`<span>`包裹着。

`<span>` 一般可以替换其它任意标签。

### 特殊情况

有的时候文本评价在代码中显示得很明显，有的时候呈现方式不同，比如 `<></>` 之间的内容也会产生文本拼接，切不易察觉。

### 其它

- Google 翻译有滞后性，意味着翻译只会固定成某一个时间点的数据，后续不会变化，即使应该变化。
- `<>` 相关在崩溃时，可以将这个标签换成正常标签试试。
- 崩溃一定是上诉文本相关原因。
- 标签结构尽量清晰简单，方便排除问题。