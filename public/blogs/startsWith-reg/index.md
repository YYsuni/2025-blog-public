
今天写判断条件时，使用 String startsWith，因为我认为 startsWith 会是最快的方式。证明一下！

## 测试

> 设备信息：
>
> - AMD Ryzen 5 5600X 6-Core Processor 3.70 GHz
> - 16.0 GB
> - node v18.12.1

```js
const loopTimes = 10 ** 2

console.log('loop times:', loopTimes)
for (let j = 0; j < 10; j++) {
	{
		console.time('startsWith')

		for (let i = 0; i < loopTimes; i++) {
			'Performance-Comparison-Regular-Expression-vs-StartsWith'.startsWith('Performance-Compa')
		}

		console.timeEnd('startsWith')
	}

	{
		console.time('reg')

		for (let i = 0; i < loopTimes; i++) {
			;/^Performance-Compa/.test('Performance-Comparison-Regular-Expression-vs-StartsWith')
		}

		console.timeEnd('reg')
	}
}
```

### 循环 10 \*\* 2 次

output:

```bash
$ node startsWith.js
loop times: 100
startsWith: 0.062ms
reg: 0.074ms
startsWith: 0.006ms
reg: 0.01ms
startsWith: 0.005ms
reg: 0.012ms
startsWith: 0.005ms
reg: 0.008ms
startsWith: 0.005ms
reg: 0.016ms
startsWith: 0.004ms
reg: 0.008ms
startsWith: 0.004ms
reg: 0.009ms
startsWith: 0.004ms
reg: 0.009ms
startsWith: 0.004ms
reg: 0.006ms
startsWith: 0.004ms
reg: 0.006ms
```

### 循环 10 \*\* 3 次

```bash
$ node startsWith.js
loop times: 1000
startsWith: 0.086ms
reg: 0.148ms
startsWith: 0.033ms
reg: 0.08ms
startsWith: 0.113ms
reg: 0.077ms
startsWith: 0.048ms
reg: 0.063ms
startsWith: 0.032ms
reg: 0.072ms
startsWith: 0.027ms
reg: 0.065ms
startsWith: 0.03ms
reg: 0.065ms
startsWith: 0.026ms
reg: 0.065ms
startsWith: 0.03ms
reg: 0.062ms
startsWith: 0.036ms
reg: 0.459ms
```

### 循环 10 \*\* 4 次

```bash
$ node startsWith.js
loop times: 10000
startsWith: 0.393ms
reg: 1.562ms
startsWith: 0.241ms
reg: 5.237ms
startsWith: 0.343ms
reg: 0.564ms
startsWith: 0.342ms
reg: 0.153ms
startsWith: 0.342ms
reg: 0.262ms
startsWith: 0.347ms
reg: 0.223ms
startsWith: 0.352ms
reg: 0.152ms
startsWith: 0.341ms
reg: 0.229ms
startsWith: 0.341ms
reg: 0.191ms
startsWith: 0.341ms
reg: 0.227ms
```

### 循环 10 \*\* 5 次

```bash
$ node startsWith.js
loop times: 100000
startsWith: 5.24ms
reg: 4.092ms
startsWith: 6.891ms
reg: 1.875ms
startsWith: 3.795ms
reg: 1.794ms
startsWith: 3.414ms
reg: 1.943ms
startsWith: 3.408ms
reg: 2.265ms
startsWith: 3.472ms
reg: 1.938ms
startsWith: 4.231ms
reg: 1.762ms
startsWith: 3.602ms
reg: 1.791ms
startsWith: 3.639ms
reg: 2.002ms
startsWith: 3.435ms
reg: 1.768ms
```

### 循环 10 \*\* 6 次

```bash
$ node startsWith.js
loop times: 1000000
startsWith: 36.477ms
reg: 20.72ms
startsWith: 39.39ms
reg: 17.669ms
startsWith: 34.748ms
reg: 17.519ms
startsWith: 35.174ms
reg: 17.366ms
startsWith: 35.09ms
reg: 17.527ms
startsWith: 34.822ms
reg: 17.597ms
startsWith: 34.615ms
reg: 17.87ms
startsWith: 35.453ms
reg: 17.855ms
startsWith: 35.786ms
reg: 17.613ms
startsWith: 34.706ms
reg: 17.6ms
```

### 循环 10 \*\* 7 次

```bash
$ node startsWith.js
loop times: 10000000
startsWith: 355.577ms
reg: 180.706ms
startsWith: 354.726ms
reg: 180.558ms
startsWith: 347.955ms
reg: 175.675ms
startsWith: 348.327ms
reg: 174.522ms
startsWith: 346.228ms
reg: 175.619ms
startsWith: 347.943ms
reg: 175.331ms
startsWith: 346.146ms
reg: 177.439ms
startsWith: 349.308ms
reg: 175.06ms
startsWith: 347.434ms
reg: 175.234ms
startsWith: 348.574ms
reg: 175.179ms
```

## 研究

事情似乎没有按照所想的那样发展，当循环增加到 10\*\*4 次时，事情开始反转，reg 耗时反而更短，到 10\*\*7 时更是有了明显差距。

### 字符长度变短

如果将测试的 string 改为如下：

```js
'Suni123'.startsWith('Suni')
;/^Suni/.test('Suni123')
```

10 \*\* 7 循环，output

```bash
$ node startsWith.js
loop times: 10000000
startsWith: 94.856ms
reg: 164.667ms
startsWith: 92.53ms
reg: 159.685ms
startsWith: 86.074ms
reg: 158.927ms
startsWith: 84.894ms
reg: 159.14ms
startsWith: 91.335ms
reg: 166.805ms
startsWith: 85.942ms
reg: 159.383ms
startsWith: 84.433ms
reg: 159.253ms
startsWith: 85.166ms
reg: 161.083ms
startsWith: 85.391ms
reg: 158.424ms
startsWith: 85.856ms
reg: 161.31ms
```

这时，startsWith 又明显更快

### 字符长度加长

```js
'Performance Comparison: Regular Expression vs. StartsWith; Performance Comparison: Regular Expression vs. StartsWith'.startsWith(
	'Performance Comparison: Regular Expression '
)
;/^Performance Comparison: Regular Expression /.test(
	'Performance Comparison: Regular Expression vs. StartsWith; Performance Comparison: Regular Expression vs. StartsWith'
)
```

output

```bash
$ node startsWith.js
loop times: 10000000
startsWith: 892.246ms
reg: 206.517ms
startsWith: 901.182ms
reg: 203.149ms
startsWith: 902.196ms
reg: 202.142ms
startsWith: 897.693ms
reg: 203.393ms
startsWith: 890.596ms
reg: 223.431ms
startsWith: 894.55ms
reg: 204.961ms
startsWith: 896.698ms
reg: 203.099ms
startsWith: 901.242ms
reg: 202.968ms
startsWith: 902.59ms
reg: 202.787ms
startsWith: 909.052ms
reg: 214.305ms
```

### 长字符，短判断

```js
'Performance Comparison: Regular Expression vs. StartsWith; Performance Comparison: Regular Expression vs. StartsWith'.startsWith(
	'Performance'
)
;/^Performance/.test(
	'Performance Comparison: Regular Expression vs. StartsWith; Performance Comparison: Regular Expression vs. StartsWith'
)
```

```bash
$ node startsWith.js
loop times: 10000000
startsWith: 228.98ms
reg: 173.04ms
startsWith: 234.776ms
reg: 167.778ms
startsWith: 228.642ms
reg: 168.327ms
startsWith: 228.746ms
reg: 174.96ms
startsWith: 228.663ms
reg: 168.228ms
startsWith: 229.287ms
reg: 167.576ms
startsWith: 227.067ms
reg: 168.668ms
startsWith: 228.117ms
reg: 168.955ms
startsWith: 227.062ms
reg: 169.838ms
startsWith: 228.28ms
reg: 168.242ms
```

### 长字符，长判断

```js
'Performance Comparison: Regular Expression vs. StartsWith; Performance Comparison: Regular Expression vs. StartsWith'.startsWith(
	'Performance Comparison: Regular Expression vs. StartsWith; Performance'
)
;/^Performance Comparison: Regular Expression vs. StartsWith; Performance/.test(
	'Performance Comparison: Regular Expression vs. StartsWith; Performance Comparison: Regular Expression vs. StartsWith'
)
```

```bash
$ node startsWith.js
loop times: 10000000
startsWith: 1.439s
reg: 237.275ms
startsWith: 1.432s
reg: 242.409ms
startsWith: 1.437s
reg: 238.463ms
startsWith: 1.425s
reg: 232.626ms
startsWith: 1.423s
reg: 234.199ms
startsWith: 1.426s
reg: 234.651ms
startsWith: 1.440s
reg: 235.122ms
startsWith: 1.429s
reg: 234.676ms
startsWith: 1.444s
reg: 234.071ms
startsWith: 1.439s
reg: 235.936ms
```

### 循环次数减少

```js
'Performance Comparison: Regular Expression vs. StartsWith; Performance Comparison: Regular Expression vs. StartsWith'.startsWith(
	'Performance Comparison: Regular Expression vs. StartsWith; Performance'
)
;/^Performance Comparison: Regular Expression vs. StartsWith; Performance/.test(
	'Performance Comparison: Regular Expression vs. StartsWith; Performance Comparison: Regular Expression vs. StartsWith'
)
```

output

```bash
$ node startsWith.js
loop times: 1000
startsWith: 0.114ms
reg: 0.159ms
startsWith: 0.061ms
reg: 0.08ms
startsWith: 0.138ms
reg: 0.064ms
startsWith: 0.056ms
reg: 0.059ms
startsWith: 0.059ms
reg: 0.071ms
startsWith: 0.059ms
reg: 0.064ms
startsWith: 0.058ms
reg: 0.062ms
startsWith: 0.056ms
reg: 0.069ms
startsWith: 0.058ms
reg: 0.062ms
startsWith: 0.143ms
reg: 0.431ms
```

10\*\*4

```bash
$ node startsWith.js
loop times: 10000
startsWith: 0.735ms
reg: 1.016ms
startsWith: 0.674ms
reg: 3.743ms
startsWith: 1.498ms
reg: 0.575ms
startsWith: 1.404ms
reg: 0.211ms
startsWith: 1.408ms
reg: 0.313ms
startsWith: 1.425ms
reg: 0.28ms
startsWith: 1.727ms
reg: 0.337ms
startsWith: 1.724ms
reg: 0.303ms
startsWith: 1.404ms
reg: 0.21ms
startsWith: 1.408ms
reg: 0.282ms
```

### 结论

短字符时，用 startsWith 更好；长字符时，用*正则判断*更好；长字符串，短字符串判定，startsWith 依旧时不错的选择。

而日常开发中，处理次数小于 10\*\*3，用 startsWith 会更好，也有更好的可读性。但当次数超过这个数量级，且判断字符串较长，使用*正则判断*会有更好的性能。

## 浏览器会如何表现？

> chrome v114.0.5735.199

![](/blogs/startsWith-reg/fa9fa753bbc678a7.png)

基本与 node 对应相同，可以推导出与 node 有相同结论。

## 其它

这次测试，让我发现可以用 `console.time` 来计时，用起来比 `Date.now` 更方便，不需要记录差值。算是一个新的发现，hha ^o^.

`console.clear` 可以手动清理信息，`console.assert` 可以在浏览器中断言，`console.trace` 可以直接看调用栈了，`console.count`可以用来在 React FC 中打印更新次数，这些都挺有用的。
