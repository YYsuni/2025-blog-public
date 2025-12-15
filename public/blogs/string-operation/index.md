
今天看了一个 next.js 的 [PR](https://github.com/vercel/next.js/pull/52517/files)，将 path 连接操作改为了字符串相加。我平时在连接字符的时候，习惯会用模板字符串。这个操作让我觉得它的效果可能更好。测试一下。

```ts
import { join } from 'path'
const absolutePath = join(dir, part.name)
// =>
import { sep } from 'path'
const absolutePath = dir + sep + part.name
```

## 测试

> 设备信息：
>
> - AMD Ryzen 5 5600X 6-Core Processor 3.70 GHz.
> - 16.0 GB
> - node v18.12.1

```js
const loopTimes = 10 ** 3

console.log('loop times:', loopTimes)
for (let j = 0; j < 10; j++) {
	{
		console.time('Template Literals')

		for (let i = 0; i < loopTimes; i++) {
			const string = `2920581597${'9755748451'}6731841261${'4148087606'}`
		}

		console.timeEnd('Template Literals')
	}

	{
		console.time('String Operation')

		for (let i = 0; i < loopTimes; i++) {
			const string = '7470435977' + '5509065748' + '8216834146' + '2266350600'
		}

		console.timeEnd('String Operation')
	}
}
```

### 循环 10 ** 3 次

```bash
$ node literals.js
loop times: 1000
Template Literals: 0.108ms
String Operation: 0.059ms
Template Literals: 0.048ms
String Operation: 0.057ms
Template Literals: 0.05ms
String Operation: 0.395ms
Template Literals: 0.184ms
String Operation: 0.052ms
Template Literals: 0.048ms
String Operation: 0.052ms
Template Literals: 0.044ms
String Operation: 0.048ms
Template Literals: 0.048ms
String Operation: 0.266ms
Template Literals: 0.018ms
String Operation: 0.024ms
Template Literals: 0.002ms
String Operation: 0.001ms
Template Literals: 0.002ms
String Operation: 0.002ms
```

### 循环 10 ** 6 次

```bash
loop times: 1000000
Template Literals: 2.425ms
String Operation: 1.251ms
Template Literals: 2.349ms
String Operation: 0.325ms
Template Literals: 0.324ms
String Operation: 0.324ms
Template Literals: 0.324ms
String Operation: 0.432ms
Template Literals: 0.324ms
String Operation: 0.347ms
Template Literals: 0.324ms
String Operation: 0.325ms
Template Literals: 0.324ms
String Operation: 0.324ms
Template Literals: 0.324ms
String Operation: 0.327ms
Template Literals: 0.351ms
String Operation: 0.467ms
Template Literals: 0.467ms
String Operation: 0.353ms
```

### 循环 10 ** 9 次

```bash
$ node literals.js
loop times: 1000000000
Template Literals: 327.606ms
String Operation: 326.944ms
Template Literals: 328.332ms
String Operation: 324.067ms
Template Literals: 324.459ms
String Operation: 326.348ms
Template Literals: 325.024ms
String Operation: 326.959ms
Template Literals: 325.483ms
String Operation: 325.172ms
Template Literals: 324.812ms
String Operation: 339.251ms
Template Literals: 325.533ms
String Operation: 325.951ms
Template Literals: 326.778ms
String Operation: 326.225ms
Template Literals: 325.101ms
String Operation: 327.872ms
Template Literals: 325.912ms
String Operation: 324.887ms
```

### 循环 10 ** 9 次 (浏览器)

![](/blogs/string-operation/c324b4dda31175d1.png)

### 结论

两者并没有实际区别。

## Join vs. String Operation

```js
const loopTimes = 10 ** 3
import { sep, join } from 'path'

console.log('loop times:', loopTimes)
for (let j = 0; j < 10; j++) {
	{
		console.time('Path Join')

		for (let i = 0; i < loopTimes; i++) {
			const absolutePath = join('2920581597', '6731841261', '4148087606')
		}

		console.timeEnd('Path Join')
	}

	{
		console.time('String Operation')

		for (let i = 0; i < loopTimes; i++) {
			const absolutePath = '7470435977' + sep + '5509065748' + sep + '8216834146' + sep + '2266350600'
		}

		console.timeEnd('String Operation')
	}
}
```

### 循环 10 ** 3 次

```bash
$ node literals-join.js
loop times: 1000
Path Join: 2.878ms
String Operation: 0.115ms
Path Join: 0.757ms
String Operation: 0.309ms
Path Join: 0.902ms
String Operation: 0.108ms
Path Join: 0.474ms
String Operation: 0.063ms
Path Join: 0.761ms
String Operation: 0.072ms
Path Join: 0.747ms
String Operation: 0.066ms
Path Join: 0.242ms
String Operation: 0.003ms
Path Join: 0.445ms
String Operation: 0.006ms
Path Join: 0.444ms
String Operation: 0.002ms
Path Join: 0.583ms
String Operation: 0.002ms
```

### 循环 10 ** 6 次

```bash
$ node literals-join.js
loop times: 1000000
Path Join: 257.74ms
String Operation: 1.718ms
Path Join: 264.481ms
String Operation: 0.328ms
Path Join: 268.848ms
String Operation: 0.329ms
Path Join: 281.358ms
String Operation: 0.329ms
Path Join: 263.217ms
String Operation: 0.347ms
Path Join: 263.732ms
String Operation: 0.329ms
Path Join: 263.908ms
String Operation: 0.327ms
Path Join: 263.112ms
String Operation: 0.455ms
Path Join: 261.133ms
String Operation: 0.348ms
Path Join: 264.144ms
String Operation: 0.328ms
```

### 循环 10 ** 7 次

```bash
$ node literals-join.js
loop times: 10000000
Path Join: 2.417s
String Operation: 4.615ms
Path Join: 2.560s
String Operation: 3.26ms
Path Join: 2.530s
String Operation: 3.253ms
Path Join: 2.521s
String Operation: 3.261ms
Path Join: 2.472s
String Operation: 3.304ms
Path Join: 2.461s
String Operation: 3.229ms
Path Join: 2.447s
String Operation: 3.255ms
Path Join: 2.440s
String Operation: 3.249ms
Path Join: 2.449s
String Operation: 3.228ms
Path Join: 2.472s
String Operation: 3.383ms
```

### 结论

`path.join` 确实更耗时

## Resolve vs. String Operation

```js
const loopTimes = 10 ** 7
import { sep, join, resolve } from 'path'

console.log('loop times:', loopTimes)
for (let j = 0; j < 10; j++) {
	{
		console.time('Path Resolve')

		for (let i = 0; i < loopTimes; i++) {
			const absolutePath = resolve('2920581597', '6731841261', '4148087606')
		}

		console.timeEnd('Path Resolve')
	}

	{
		console.time('String Operation')

		for (let i = 0; i < loopTimes; i++) {
			const absolutePath = '7470435977' + sep + '5509065748' + sep + '8216834146' + sep + '2266350600'
		}

		console.timeEnd('String Operation')
	}
}
```

### 循环 10 ** 3 次

```bash
$ node literals-join.js
loop times: 1000
Path Resolve: 3.662ms
String Operation: 0.315ms
Path Resolve: 1.307ms
String Operation: 0.105ms
Path Resolve: 1.101ms
String Operation: 0.046ms
Path Resolve: 1.615ms
String Operation: 0.037ms
Path Resolve: 0.717ms
String Operation: 0.047ms
Path Resolve: 0.564ms
String Operation: 0.039ms
Path Resolve: 0.557ms
String Operation: 0.002ms
Path Resolve: 0.539ms
String Operation: 0.004ms
Path Resolve: 0.548ms
String Operation: 0.002ms
Path Resolve: 0.698ms
String Operation: 0.002ms
```

### 循环 10 ** 6 次

```bash
$ node literals-join.js
loop times: 1000000
Path Resolve: 535.521ms
String Operation: 1.66ms
Path Resolve: 529.712ms
String Operation: 0.329ms
Path Resolve: 514.061ms
String Operation: 0.328ms
Path Resolve: 520.766ms
String Operation: 0.408ms
Path Resolve: 519.928ms
String Operation: 0.339ms
Path Resolve: 508.505ms
String Operation: 0.329ms
Path Resolve: 514.875ms
String Operation: 0.327ms
Path Resolve: 519.519ms
String Operation: 0.33ms
Path Resolve: 532.188ms
String Operation: 0.329ms
Path Resolve: 519.32ms
String Operation: 0.409ms
```

### 循环 10 ** 7 次

```bash
$ node literals-join.js
loop times: 10000000
Path Resolve: 5.361s
String Operation: 4.812ms
Path Resolve: 5.148s
String Operation: 3.381ms
Path Resolve: 5.129s
String Operation: 3.279ms
Path Resolve: 5.053s
String Operation: 3.272ms
Path Resolve: 5.055s
String Operation: 3.259ms
Path Resolve: 4.994s
String Operation: 3.288ms
Path Resolve: 5.466s
String Operation: 3.28ms
Path Resolve: 5.010s
String Operation: 3.338ms
Path Resolve: 5.048s
String Operation: 3.279ms
Path Resolve: 5.086s
String Operation: 3.36ms
```

### 结论

`resolve` 将更加耗时，是 `join` 的两倍