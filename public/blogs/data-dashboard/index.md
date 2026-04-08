渲染方面，国内有个比较热门的地图渲染，在科技展厅喜欢设置的数据大屏。

通过 b 站搜索，搜到一个我认为好看的一个[视频](https://www.bilibili.com/video/BV1oy4y147sa)，发现它这个不是一个网站，而是一个古早的软件，渲染环境不同。但是我感觉可以还原。

## 地图

这个地图包括两部分，一个世界地图，一个中国地图。颗粒度上，整个世界地图特别大。所有优化大小，只取国家地图，加上中国省份地图。

国家地图，也只取亚洲相邻部分。投影方式选择 **墨卡托**。

![](/blogs/data-dashboard/03c2f55a38f1566e.webp)

中国地图需要单独下载省份。然后进行 **挤出** 操作。世界地图和和中国地图边界有细微不同，所以需要中国地图去稍微掩盖。在根据参考，分别挤出部分省份。

![](/blogs/data-dashboard/c5ab3da3dd7d51b1.webp)

## 后期处理

![](/blogs/data-dashboard/664e67d1d0ad5d22.webp)

这里需要加上 Bloom 效果，让发光有光晕，再加上一些对比度。

```tsx
<EffectComposer>
	<Bloom intensity={1} />
	<BrightnessContrast brightness={0} contrast={0.05} />
</EffectComposer>
```

## 灯光

![](/blogs/data-dashboard/8787c0bf9a697fec.webp)

全局暗光铺上基本颜色，面光打造阴影和光面增加立体感，强烈的点光增加视觉效果。

```tsx
<ambientLight intensity={0.2} />
<ControllableDirectionalLight intensity={0.6} position={[7.6481, 3.365, -15.127]} />
<ControllablePointLight intensity={12.7} position={[1.8417, 3.0596, -3.5541]} decay={0.6} color='#acdfff' />
```

## 数据

![](/blogs/data-dashboard/595531d76485cc44.webp)

地图上标记数据，让内容丰满。


## 装饰
![](/blogs/data-dashboard/4abd482d08114c47.webp)

在 Figma 中制作一张圆圈点图，放置在地图上。

## Demo

[https://suni-3d.vercel.app/map-01](https://suni-3d.vercel.app/map-01)

<iframe
	src='https://suni-3d.vercel.app/map-01'
	style={{ border: 0 }}
	allowfullscreen
	width="100%"
	height="500px"
	loading='lazy'></iframe>