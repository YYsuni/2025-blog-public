
## Figma + framer-motion

- 相比于设计软件，或者专门的 svg editor，Figma 有着功能足够，使用方便，运行流畅的体验，具有一定的前端友好。

- `framer-motion` 或者 `react-spring` 都差不多，主要都用来变换数字。

## 设计方面

- Figma 要将圆做成 4 个以上的点，4 个点对于圆的变换不够自然。

![](/blogs/dynamic-circle/6a14abf139c3164a7d412a1dbf7224fa887ee4f2e82e047f4dc8adb53521e2ce.png)

- 变换图形时，大胆一点，让图形有更大的变化。

![](/blogs/dynamic-circle/0b2bbef823b7f8276a22a76ad54931132d563f6c2418b1da1fb4baadbd0b0e2b.png)

- 导出 svg 时需要关闭 `Simplify Stroke` 选项，不然 path 的节点会被更改。

![](/blogs/dynamic-circle/9994bd682761f9771a177b6dab0a4d5530dc4d7d67044bbf9f8373f0d7017c55.png)

## 代码方面

- 先处理 `d` 数据

```ts
const ds = [
	'M100 40C118.483 40 139.5 48.5 152.5 71C164.5 91.7692 163.486 125.627 137.921 146.5C114.766 165.405 80 163.929 58.5 143.333C36 121.779 36 92 48 69.5C58.8389 49.1771 82.4725 40 100 40Z',
	'M100 39.5C125.213 42.7176 144.835 50.428 155.5 73.5C167.582 99.6363 151.581 116.939 130 136C103.485 159.419 71.6185 166.406 47 141C23.5889 116.84 18.5721 79.1434 42 55C58.3271 38.1742 76.7433 36.5321 100 39.5Z',
	'M97 36.5C125 36.5 150 48 162.5 68C175 88 163.565 120.627 138 141.5C112.435 162.373 61.3212 161.152 42 138.5C27.5 121.5 34.7505 86.8563 47.5 65C58 47 79.4725 36.5 97 36.5Z',
	'M102 31.5C120.483 31.5 138.063 46.5 151.5 68C164 88 166.565 128.627 141 149.5C117.846 168.405 78.5 167.096 57 146.5C34.5 124.946 41.4649 94.0209 53 71.5C63.5 51 84.4725 31.5 102 31.5Z'
]
const dArr = ds.map(item =>
	item
		.slice(1, -1)
		.split(/[C ]/)
		.filter(item => !!item)
		.map(item => +item)
)
```

> 点位置可能导出时位置不统一，需要手动改变，保证`M`后的两个数据相差不大（即是同一个起点），教程参考：[https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)

- 声明动态数据

由于 `frame-motion`/`react-spring` 都不能操作 _数字数组_ ，所以需要批量声明

```ts
const dPathArr = dArr[0].map(item => useMotionValue(item))
```

- 转换并使用

使用 `useTransform` 而不使用 `useMotionTemplate` ，因为 `useTransform` 不需要像 `useMotionTemplate` 书写大量重复代码。

```tsx
const d = useTransform(
	dPathArr,
	() =>
		`M${dPathArr[0].get()} ${dPathArr[1].get()} ${new Array(5)
			.fill(0)
			.map(
				(_, i) =>
					'C' +
					dPathArr
						.slice(2 + i * 6, 2 + (i + 1) * 6)
						.map(item => item.get())
						.join(' ')
			)
			.join(' ')} Z`
)

return (
	<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200' fill='none'>
		<rect width='200' height='200' fill='#F0EDE7' />
		<motion.path d={d} stroke='#403D3C' />
	</svg>
)
```

- 动画编排
  - 从 `0` 进入 `1` => `2` => `3` => `1` 循环;
  - `useRef` 在这里比 `useState` 更好用。

```ts
const [scope, animate] = useAnimate()
const animationsRef = useRef<AnimationPlaybackControls[]>()

const animates = () => {
	animationsRef.current = dPathArr.map((item, index) => animate(item, dArr[1][index], { duration: 1 }))
	Promise.all(animationsRef.current).then(() => {
		animationsRef.current = dPathArr.map((item, index) =>
			animate(item, [dArr[1][index], dArr[2][index], dArr[3][index], dArr[1][index]], {
				duration: 3,
				repeat: Infinity
			})
		)
	})
}

useEffect(() => {
	animates()

	return () => animationsRef.current?.forEach(item => item.stop())
}, [])
```

- Hover 交互
  - 这里后续加一个 `_count++` 防止动画冲突

```tsx
<svg
	className=' cursor-pointer'
	onMouseEnter={() => {
		animationsRef.current = dPathArr.map((item, index) => animate(item, dArr[0][index], { duration: 0.5 }))
	}}
	onMouseLeave={() => {
		animates()
	}}

```