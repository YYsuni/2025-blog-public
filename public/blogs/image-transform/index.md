
页面图片展示，图片全屏展示。

方案常规有

- 展示组件，将多张照片自动聚合成册，点击全屏查看。
- 独立详情页面，左侧为大屏图像，右侧作品信息。
- 为提高流畅度，通常采用独立全屏组件。

这里记录一种图片直接变化到全屏展示。极少代码，更好的展示过度效果。

```tsx
import { motion } from 'motion/react'

export default function ImageTransfrom() {
	const [display, setDisplay] = useState(false)

	return (
		<figure onClick={() => setDisplay(s => !s)} className='relative w-[240px] cursor-pointer'>
			<img src={src} className='opacity-0' loading='lazy' />
			<div
				className={
					display
						? 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-20 transition-colors duration-300 max-sm:p-4'
						: 'absolute inset-0 bg-black/0'
				}>
				<motion.img layout src={src} />
			</div>
		</figure>
	)
}
```

- 过度用到了 `motion` 的 `layout`
- image 多用一个 div 包括跟换空间容器
- `transition-colors` 注意单独用在 fixed 状态下，不然会出现 “黑闪” (bg-black)
- 多写一个 `opacity-0` img，为了内容高度拉扯。
  - 容器空间固定宽高可不用。
