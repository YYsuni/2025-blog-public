早上看到一篇文章：[《浏览器中液态玻璃》](https://kube.io/blog/liquid-glass-css-svg/)，文章我只能明白玻璃折射率，置换，其它的看不懂。

但是我发现这个经过它的指引，很容易就能实现，并且我感觉好好玩。允许我在 blog 上放一段时间这个组件。

代码上**很简单**，在这个blog 仓库目录的 `components/liquid-grass` 目录。

## 实现

逻辑是，两个**置换**，组合一个边缘。嫌麻烦可以不要边缘效果。

```tsx
const width = 210
const height = 150

<div
	style={{ width, height }}
	className='fixed top-0 left-0 z-90 select-none'
	whileTap={{
		scale: 1.1
	}}>
	<svg colorInterpolationFilters='sRGB' style={{ display: 'none' }}>
			<defs>
				<filter id='magnifying-glass-filter'>
					<feImage href={displacement1.src} x='0' y='0' width={width} height={height} result='magnifying_displacement_map' />
					<feDisplacementMap in='SourceGraphic' in2='magnifying_displacement_map' scale='24' xChannelSelector='R' yChannelSelector='G' result='magnified_source' />
					<feGaussianBlur in='magnified_source' stdDeviation='0' result='blurred_source' />
					<feImage href={displacement2.src} x='0' y='0' width={width} height={height} result='displacement_map' />
					<feDisplacementMap in='blurred_source' in2='displacement_map' scale='80' xChannelSelector='R' yChannelSelector='G' result='displaced' />
					<feColorMatrix in='displaced' type='saturate' result='displaced_saturated' values='9'></feColorMatrix>
					<feImage href={borderImg.src} x='0' y='0' width={width} height={height} result='specular_layer'></feImage>
					<feComposite in='displaced_saturated' in2='specular_layer' operator='in' result='specular_saturated'></feComposite>
					<feComponentTransfer in='specular_layer' result='specular_faded'>
						<feFuncA type='linear' slope='0.5'></feFuncA>
					</feComponentTransfer>
				<feBlend in='specular_saturated' in2='displaced' mode='normal' result='withSaturation'></feBlend>
				<feBlend in='specular_faded' in2='withSaturation' mode='normal'></feBlend>
			</filter>
		</defs>
	</svg>

	<div
		onClick={() => setIsTouched(true)}
		className='absolute inset-0 rounded-full'
		style={{
			backdropFilter: 'url(#magnifying-glass-filter)',
			boxShadow: 'rgba(0, 0, 0, 0.05) 0px 4px 9px, rgba(0, 0, 0, 0.05) 0px 2px 24px inset, rgba(255, 255, 255, 0.2) 0px -2px 24px inset'
		}}>
	</div>
</div>

```

## 原理

最开始以为它只能在 svg 中实现，意味着需要把网址内容刻入到 svg，结果它并不需要，二是直接能在文档流使用，这就太**方便**了。

只需要 svg 内容写好，**backdropFilter** 引出来用就行，虽然限制在 **chrome** 中使用，但是光是自己玩就够够的了。
