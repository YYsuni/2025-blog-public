
## 背景

处理大量点集的时候使用 `[number, number]` 还是 `{x:number, y: number}`。

常规看，使用 array 会有更好的提升性能。因为数组是有序数据，只需要一个 `基地址` + 偏移量就能够访问到数据。而 Object 的属性访问就要经过 hash 表映射这一步，再拿到偏移量去访问内存值。这样看上去数组优势就有必要在意。

但经过测试，效果居然大跌眼镜。

## 测试

理论上，需要测试浏览器环境的运行时间、运行内存占用。但是经过尝试，内存占用 `window.performance.memory.usedJSHeapSize` 值始终不会变动。

我尝试怀疑是 GC 处理太快，将数据持有到打印之后，数据依旧没有变化。甚至，整个 window.performance.memory 都不会有任何变化。所以本次测试忽略内存情况。

- 猜测，V8 启动 js 虚拟环境是已经预分配足够的内存，所以在没有特殊情况下，是不会增加内存。

### 测试时间

书写代码内容：

- 次数为 100 万次
- 生成数据 push 入集合
- 遍历访问
- 遍历修改

```ts
const testCount = 1000000

function testArray() {
	const points = []
	for (let i = 0; i < testCount; i++) {
		points.push([Math.random(), Math.random()])
	}

	let sumX = 0,
		sumY = 0
	for (let i = 0; i < testCount; i++) {
		sumX += points[i][0]
		sumY += points[i][1]
	}

	for (let i = 0; i < testCount; i++) {
		points[i][0] += 1
		points[i][1] += 1
	}
}

function testObject() {
	const points = []
	for (let i = 0; i < testCount; i++) {
		points.push({ x: Math.random(), y: Math.random() })
	}

	let sumX = 0,
		sumY = 0
	for (let i = 0; i < testCount; i++) {
		sumX += points[i].x
		sumY += points[i].y
	}

	for (let i = 0; i < testCount; i++) {
		points[i].x += 1
		points[i].y += 1
	}
}
```

测试结果不相上下，即使将次数改为 1 千万次。

### 优化测试

优化顺序，防止出现冷启动问题，随机先后执行，执行多次，取平均值

```ts
function testTime() {
	const iterations = 10

	for (let i = 0; i < iterations; i++) {
		if (Math.random() > 0.5) {
			// array => object
		} else {
			// object  => array
		}
	}
}
```

结果依旧不相上下

### 添加属性

属性过少无法判定完整情况

```ts
points.push([
	Math.random(),
	Math.random(),
	`color${i % 10}`,
	i % 100,
	Math.random(),
	Math.random(),
	Math.random(),
	Math.random(),
	Math.random(),
	Math.random()
])

points.push({
	coordX: Math.random(),
	coordY: Math.random(),
	hue: `color${i % 10}`,
	mass: i % 100,
	attrAlpha: Math.random(),
	attrBeta: Math.random(),
	attrGamma: Math.random(),
	attrDelta: Math.random(),
	attrEpsilon: Math.random(),
	attrZeta: Math.random()
})
```

这下出现反常识的事情了：

```
// const testCount = 1000000
Average Array Time: 330.960 ms
Average Object Time: 171.580 ms
Median Array Time: 341.200 ms
Median Object Time: 188.700 ms
```

数组反而会更耗时

### Read / Write

先去除 Write

```
Average Array Time: 195.040 ms
Average Object Time: 143.280 ms
Median Array Time: 186.600 ms
Median Object Time: 140.600 ms
```

再去除 Read

```
Average Array Time: 177.260 ms
Average Object Time: 102.540 ms
Median Array Time: 188.800 ms
Median Object Time: 103.900 ms
```

## 时间结论

在多值的情况下，object 表现会更好。耗费时间集中在 write。即使是 push，object 的 push 操作也会更快。

现代 JavaScript 引擎（如 V8）对对象的属性访问进行了高度优化。特别是当对象的结构固定时（即属性数量和类型不变）。

### 其他测试

我尝试每个object 都随机设置新属性，访问时随机访问不一定存在的属性。结果浏览器崩溃了 QAQ。

## 测试内存

测试内存上，我发现了一个办法。就是浏览器会在自动显示当前使用内存，只需要运行不同情况查看当前运行内存大小就有一个大概比较。

测试方式，不断关闭打开浏览器，然后查看内存占用。也可以查看`任务管理器` 查看占用内存

更改运行内容，继续观察。

```
Object: 600+ MB
Array: 800 ~ 1200 MB
```

### 内存结论

内存占用上，Object 依旧有更好的表现

## 结论

在大多数情况下，固定属性的 object 集合更适合处理，无需采用数组去优化性能。

## Nodejs 情况

将当前代码直接在 node.js 中运行

```
$ node -v
v21.6.2

$ node test.js
Average Array Time: 598.258 ms
Average Object Time: 312.044 ms
Median Array Time: 678.761 ms
Median Object Time: 244.425 ms
```

Array 依旧更加耗时

### Test 代码留底

若怀疑代码书写方面或许有误，可具体查看

```js
function testArray() {
	const points = []
	for (let i = 0; i < testCount; i++) {
		points.push([
			Math.random(),
			Math.random(),
			`color${i % 10}`,
			i % 100,
			Math.random(),
			Math.random(),
			Math.random(),
			Math.random(),
			Math.random(),
			Math.random()
		])
	}
	let sumX = 0,
		sumY = 0,
		sumWeight = 0,
		sumAttr1 = 0,
		sumAttr2 = 0,
		sumAttr3 = 0,
		sumAttr4 = 0,
		sumAttr5 = 0,
		sumAttr6 = 0
	for (let i = 0; i < testCount; i++) {
		const point = points[i]
		sumX += point[0]
		sumY += point[1]
		sumWeight += point[3]
		sumAttr1 += point[4]
		sumAttr2 += point[5]
		sumAttr3 += point[6]
		sumAttr4 += point[7]
		sumAttr5 += point[8]
		sumAttr6 += point[9]
	}
	for (let i = 0; i < testCount; i++) {
		const point = points[i]
		point[0] += 1
		point[1] += 1
		point[3] += 1
		point[4] += 1
		point[5] += 1
		point[6] += 1
		point[7] += 1
		point[8] += 1
		point[9] += 1
	}
}

function testObject() {
	const points = []
	for (let i = 0; i < testCount; i++) {
		points.push({
			coordX: Math.random(),
			coordY: Math.random(),
			hue: `color${i % 10}`,
			mass: i % 100,
			attrAlpha: Math.random(),
			attrBeta: Math.random(),
			attrGamma: Math.random(),
			attrDelta: Math.random(),
			attrEpsilon: Math.random(),
			attrZeta: Math.random()
		})
	}
	let sumX = 0,
		sumY = 0,
		sumWeight = 0,
		sumAttr1 = 0,
		sumAttr2 = 0,
		sumAttr3 = 0,
		sumAttr4 = 0,
		sumAttr5 = 0,
		sumAttr6 = 0
	for (let i = 0; i < testCount; i++) {
		const point = points[i]
		sumX += point.coordX
		sumY += point.coordY
		sumWeight += point.mass
		sumAttr1 += point.attrAlpha
		sumAttr2 += point.attrBeta
		sumAttr3 += point.attrGamma
		sumAttr4 += point.attrDelta
		sumAttr5 += point.attrEpsilon
		sumAttr6 += point.attrZeta
	}
	for (let i = 0; i < testCount; i++) {
		const point = points[i]
		point.coordX += 1
		point.coordY += 1
		point.mass += 1
		point.attrAlpha += 1
		point.attrBeta += 1
		point.attrGamma += 1
		point.attrDelta += 1
		point.attrEpsilon += 1
		point.attrZeta += 1
	}
}
```