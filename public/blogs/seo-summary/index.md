> 在 Google SEO 设计中，需要设置正确的 Favicon、Title、Description、Keywords、Image alt 以外，这些信息的展示也会在 网站在 Twitter/Discord/TG 的交流中要有正确的卡片信息展示。
> 开发中总是匆匆忙忙，容易疏忽细节，唯有落笔不易遗忘。

第一点要提的是，SEO 排名，永远跟用户访问量挂钩，开发能做的只能是给搜索引擎提供更准确清晰的文案、数据。

信息更新需要时间消化，也可以尝试一些小技巧促进更新进程。比如 Google Search Console 里面设置更新的 sitemap。

## 1. 重要的 Favicon, Title, Description

### 1.1 Favicon

```html
<link rel="shortcut icon" href="path/to/favicon.ico" type="image/x-icon" />
```

Favicon 设置中，shortcut 字段，type 字段在现代浏览器中都可以不要：

```html
<link rel="icon" href="/favicon.ico" />
```

Favicon 的文件类型推荐的优先级是 ico > png > svg > gif ，ico 支持性好，但 png 格式文件更小更通用。SVG 格式用起来方便但在有的时候会解析失败。gif 没试过，目前没见过那个网站使用过。

> 建议保留一个 favicon.svg 文件，应对更大尺寸的需求

Favicon 可以设置多个尺寸，以适应多种设备，包括到 180x180 的 apple-touch-icon, 安卓启动屏幕的 512x512 尺寸，这篇文章有最新总结 [《How to Favicon in 2025: Three files that fit most needs》](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)

> - 57×57 像素：适用于旧版 iPhone 和 iPod Touch。
> - 72×72 像素：适用于 iPad。
> - 114×114 像素：适用于视网膜屏幕的 iPhone 和 iPod Touch。
> - 144×144 像素：适用于 iPad 3。

有时候我们 html 用不上这么多文件尺寸，但是这些文件同时可以用在 PWA 中设置在 manifest.json 使用，这时就会用上这些比较大的尺寸，比如用来做手机图标的至少要 64x64 ，ipad 的至少要 128x128，所以放一张大于 180 的图片还是比较重要。

**注意**：设置多个时候，浏览器会直接使用第一个 `<link rel="icon" />` ，所以需要的具体要使用的文件需要设置在第一行。

### 1.2 Title, Description

Keywords 目前没那么重要，使用过程中并未发现任何相关性，网上也没有文章证明其作用，倒是有言论其无用的文章。

Title 和 Description 设置是最重要的关键信息，可以直接设置头部，但是每一个页面都需要静态生成不同的文案，所以利用 Next.js 的 `Metadata` 特性自动设置，可以在每一个页面静态设置一个 `metadata`

```ts
export const metadata: Metadata = {
	title: 'xxx',
	description: 'xxx',
	keywords: 'xxx'
}
```

## 2. 适配 Twitter/Discord/Telegram

这其中，Twitter 设置是最麻烦的，先说其他两个

### 2.1 Discord/TG

Discord 发消息中，链接在消息中会第一时间开始解析展示，但 Discord 优先会识别 OG 类型的 title 与 description，并且如果设置了 `og:title` ，没有设置 `og:description`, 即使设置了 `<meta name="description">`，Description 部分也会显示为空。这一点 Teglegram 就会好一些，有回退处理。

所以设置 title，desc 的时候一定同时设置更新部分：

```ts
const title = 'xxx',
	description = 'xxx',
	keywords = 'xxx'

export const metadata: Metadata = {
	title,
	description,
	keywords,
	openGraph: {
		title,
		description
	}
}
```

Next.js 设置 `openGraph` 还有个好处，就是可以不用关心设置 `<meta />` 的时候使用 `name` 还是 `property` 问题了。

Discord/TG/Twitter 都有缓存问题，由于 Discord/TG 是立即在消息中去解析，所以会更好去 debug 一些。

### 2.2 Debug

可以测试没有发送过的链接，这样会直接查看添加的文案是否更新。

如果需要查看同一个网页，可以在页面链接后面加一个后缀 `?v=1` ，这样就会变成一个新的链接去加载。

缓存问题会同时导致更新不同的 `og:image` 不生效，因为图片是同一个链接的问题。所以这个时候也可以在在不改变文件名的情况下，链接后面加一个后缀 `?_=xxx` ，xxx 可以不断更换成新的标记。

### 2.3 Twitter

Twitter 不会使用 html + og 的数据，必须使用 `twitter` 自己的特征值 `<meta name="twitter:xxx" content="xxx">` ，同时还要指定 `twitter:card` 决定展示的大小方式。

**注意**：Twitter 设置图片还不能使用相对路径如 `/cover.png`，必须使用绝对路径。

Twitter 在加载 twitter 相关 meta 信息的时候，容易崩溃，一旦哪些信息不符合，就会不加载所有信息。所以 Twitter 的设置必须严谨认真设置完整。

Twitter 的 `twitter:title`, `twitter:description` 更新比较快，设置好 30 秒后就能看到新的文案。同样可以通过更新后缀 `?v=1` 去 debug 新的设置是否生效。

```ts
const title = 'xxx',
	description = 'xxx',
	keywords = 'xxx'

export const metadata: Metadata = {
	title,
	description,
	keywords,
	openGraph: {
		title,
		description
	},
	twitter: {
		title,
		description
	}
}
```

Twitter 的图片就比较慢，需要过半天或几天，才能看到新的图片，所以设置图片时候，尽量优化大小，让 twitter 解析图片是不要出现问题。

type 如果设置 `summary` 的话，实际大小会在 120x120 左右，设置一张 240x240 就可以应对 Discord/TG/Twitter 这几个地方了，再通过压缩大小，可以压缩到 10kb 左右。

Twitter 会采用 `twitter:image` 的资源，`og:image` 的设置并不会对 `twitter:image` 造成影响。

`og:image:width`，`og:image:height`，`og:image:type` 的设置是非必须的。

**注意**：如果网站数据采集的有问题，需要去 [https://cards-dev.x.com/validator](https://cards-dev.x.com/validator) 这个网站清理下缓存，然后等 3 ~ 5 分钟就可以了，不然同一个网址新的数据将很久很久（或许是永久）不会更新。

## 3. 不确定的东西

`<script type="application/ld+json">` 可以给搜索引擎提供一些结构化的信息内容，但尚未有实际证明其作用。

1.  对于页面中折叠或切换等 “隐藏” 的文案，可以在其中展示。
2.  可以添加一些 Meta 信息

## 4. PWA

PWA 让网站成用户的一个 APP，让用户可以在 PC/MAC 浏览器的右上角（安装按钮）安装。手机在 _分享按钮_ - _添加到主屏幕_

必须条件有：

1. Web 应用尚未安装
2. 用户互动:
   - 用户至少需要点击或点按页面一次（随时，即使是在前一次页面加载期间）
   - 用户需要在任何时间点查看该网页至少 30 秒
3. 通过 HTTPS，或者 Localhost 开发时
4. `manifest.json` 必须包含:
   - short_name 或 name
   - icons - 必须包含 192 像素和 512 像素的图标 (链接必须正确，尺寸大小必须对应好)
   - start_url
   - display - 必须是 fullscreen、standalone、minimal-ui 或 window-controls-overlay 中的一个
   - prefer_related_applications 不得存在，也不得为 false

> manifest.json 里面的错误一般可以在 console 中查看到

可以设置 form_factor，screenshots 来设置默认截图，大概几个地方使用（不确定了）：

- 在启动时
- 在 hover 时的悬浮显示

`short_name` 尽量简写，因为手机上显示不了太长名称。

`theme_color` 可以设置任务栏颜色，默认白色，优先级低于 `<meta name='theme-color'>`。
设置 HTML 的更好，可以自动适配 dark 模式：

```html
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#FFF" />
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#333" />
```

`background_color` 是加载页面前填充的颜色，需要和网页背景颜色保持一致。默认白色，无特殊情况不用设置。

### 4.1 图标

图标尺寸上，app 点击会有个放大的过程，如果在意细节可以设置到 512 尺寸。

App 图标圆角白边问题，手机会自动对图标设置一个圆角，圆角大小在不同设备不固定，而 PC 不会。icons 里面设置 maskable 并不能解决圆角问题，pc 与手机会优先使用非 maskable 图片，而 manifest 中必须设置一个 非 maskable 图片，尚不清楚如何解决。

解决办法是设计图标时，采用较小的圆角。

IOS 设备会读取 `<link rel='apple-touch-icon' />` 文件，所以要注意。