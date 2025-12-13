
> [https://path-motion.yysuni.com/](https://path-motion.yysuni.com/)

## 1. CSS

首先，第一种是 CSS 实现方式。

采用 `offset-path`，使用 `animation` 让 `offset-distance` 从 0% => 100%

```css
offset-path: path('M179.43,103.86 ...');
animation: move 3000ms infinite ease-in-out;

@keyframes move {
	0% {
		offset-distance: 0%;
	}
	100% {
		offset-distance: 100%;
	}
}
```

## 2. SVG

第二种，SVG

```svg
<path
	fill='none'
	stroke='lightgrey'
	d='M179.43,103.86 ...'
/>

<rect width="16" height="16" fill='rgb(75, 85, 99)'>
	<animateMotion
		dur='3s'
		rotate='auto'
		repeatCount='indefinite'
		path='M179.43,103.86 ...'
		calcMode='spline'
		keyTimes='0; 1'
		keySplines='0.5 0 0.5 1'
	/>
</rect>
```

## 3. JS

最后是 JS 代码控制

```tsx
import { animate } from 'motion'
import { useEffect, useRef } from 'react'
import { getPointAtLength, getTotalLength } from 'svg-path-commander'

const d = 'M179.43,103.86 ... '
const pathLength = getTotalLength(d)

export default function JSMotion() {
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (ref.current) {
			animate(0, 100, {
				repeat: Infinity,
				ease: 'easeInOut',
				onUpdate: latest => {
					const currentLength = (latest / 100) * pathLength
					const { x: currentX, y: currentY } = getPointAtLength(d, currentLength)
					ref.current!.style.left = currentX + 'px'
					ref.current!.style.top = currentY + 'px'

					const { x: nextX, y: nextY } = getPointAtLength(d, currentLength + 1)
					const dx = nextX - currentX
					const dy = nextY - currentY
					const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90

					ref.current!.style.rotate = angle + 'deg'
				},
				duration: 3
			})
		}
	}, [ref.current])

	return (
		<div className=' relative w-full h-[400px] bg-gray-50 rounded border'>
			<div ref={ref} className='w-4 h-4 bg-gray-600 absolute'></div>
		</div>
	)
}
```

### 3.1 JS - native

使用会发现，js 计算点，会话 0.05s 的时间，并且不稳定，导致运行不流畅。通过 SVG 的原生 method 就可以提效 1000 倍。

```ts
const pathElement = document.getElementById('path') as any as SVGPathElement
if (!pathElement) return

const pathLength = pathElement.getTotalLength()

currentAnimation = animate(0, 100, {
	ease: 'linear',
	onUpdate: latest => {
		const currentLength = (latest / 100) * pathLength
		const { x: currentX, y: currentY } = pathElement.getPointAtLength(currentLength)
		ref.current!.style.left = currentX + 'px'
		ref.current!.style.top = currentY + 'px'

		const nextPoint = pathElement.getPointAtLength(currentLength + 1)
		const angle = Math.atan2(nextPoint.y - currentY, nextPoint.x - currentX) * (180 / Math.PI) + 90

		ref.current!.style.rotate = angle - 90 + 'deg'
	},
	duration: pathLength / +speed,
	onComplete() {
		ref.current!.style.display = 'none'
	}
})
```

## 感受

CSS 比较简单，直接应用在正常的 HTML 环境中。SVG 方式就依赖一个稳定的 svg 环境，里面的大小会被 svg 的大小缩放。设置 ease 需要 keySplines 去细微调整，需要花点心思。

CSS 的运动类似 relative 的偏移效果。SVG 就相当于在 svg 环境内设置 x,y 值。

JS 设置依赖 `animate` 库 + path 工具库（`svg-path-commander`） + 一些计算。

简单的循环动画/单播动画，就 CSS 实现比较方便快捷。SVG 可以快捷的实现根据页面大小缩放。

JS 可以编排多个播放逻辑，适合复杂动画。