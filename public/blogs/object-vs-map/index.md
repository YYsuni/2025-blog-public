## 测试时间

测试结果：

```
Testing with 100000 entries:
Object: Insert time: 42.30ms, Check time: 15.40ms
Map: Insert time: 18.00ms, Check time: 6.80ms
Set: Insert time: 9.00ms, Check time: 3.30ms

Testing with 10000 entries:
Object: Insert time: 2.30ms, Check time: 0.90ms
Map: Insert time: 0.90ms, Check time: 0.50ms
Set: Insert time: 0.80ms, Check time: 0.50ms
```

测试代码：

```ts
const testSize = 10000 // 测试数据量大小

function testObject() {
	const obj = {}
	const startTime = performance.now()

	// 插入数据
	for (let i = 0; i < testSize; i++) {
		obj[`key${i}`] = `value${i}`
	}

	const insertTime = performance.now() - startTime

	// 查找数据
	const startTimeCheck = performance.now()
	for (let i = 0; i < testSize; i++) {
		const exists = obj.hasOwnProperty(`key${i}`)
	}

	const checkTime = performance.now() - startTimeCheck

	console.log(`Object: Insert time: ${insertTime.toFixed(2)}ms, Check time: ${checkTime.toFixed(2)}ms`)
}

function testMap() {
	const map = new Map()
	const startTime = performance.now()

	// 插入数据
	for (let i = 0; i < testSize; i++) {
		map.set(`key${i}`, `value${i}`)
	}

	const insertTime = performance.now() - startTime

	// 查找数据
	const startTimeCheck = performance.now()
	for (let i = 0; i < testSize; i++) {
		const exists = map.has(`key${i}`)
	}

	const checkTime = performance.now() - startTimeCheck

	console.log(`Map: Insert time: ${insertTime.toFixed(2)}ms, Check time: ${checkTime.toFixed(2)}ms`)
}

function testSet() {
	const set = new Set()
	const startTime = performance.now()

	// 插入数据
	for (let i = 0; i < testSize; i++) {
		set.add(`key${i}`)
	}

	const insertTime = performance.now() - startTime

	// 查找数据
	const startTimeCheck = performance.now()
	for (let i = 0; i < testSize; i++) {
		const exists = set.has(`key${i}`)
	}

	const checkTime = performance.now() - startTimeCheck

	console.log(`Set: Insert time: ${insertTime.toFixed(2)}ms, Check time: ${checkTime.toFixed(2)}ms`)
}

function runTests() {
	console.log(`Testing with ${testSize} entries:`)
	testObject()
	testMap()
	testSet()
}

runTests()
```

## 测试内存

```
const testSize = 1_000_000

object: 242MB
map: 180MB
set: 181MB

```

## 结论

Map 确实会更好。