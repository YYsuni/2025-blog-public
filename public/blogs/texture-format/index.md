图片格式，我们平时用 `png`, `jpg`。

但为了简单记，一般就只默认使用 `png` ，大多数情况都能很好适应，支持透明度，图片大小也能接受，平时只需要注意压缩一下。

但到了**3D 材质**应用方面，**png** 格式差太多。

## 材质文件

下载一份材质文件：[https://polyhaven.com/a/clay_roof_tiles_02](https://polyhaven.com/a/clay_roof_tiles_02)

![](/blogs/texture-format/0bf56114b257a610.png)

`png` 格式明显比 `jpg` 格式大太多

## 压缩后

这里使用 _iLoveIMG_ 压缩。

![](/blogs/texture-format/a333b161dc2810c4.png)

`jpg` 依旧有不小优势

## JPG 格式一定更小么

AI 直接解释：

```md
### 什么时候 JPG 更小？

照片类、渐变多、颜色复杂的图像

因为 JPG 是有损压缩，会牺牲一些质量换取更小体积
例如：风景照、人像、夜景
通常 JPG 会明显比 PNG 小很多。

### 什么时候 PNG 更小？

纯色块、图标、UI、线条、截图、简单图形

PNG 是无损压缩，对简单图非常高效
例如：App 图标、UI 按钮、文本截图、Logo
此时 PNG 往往比 JPG 小得多，而且不会模糊。
```

jpg 格式也不支持 **透明度**

## Webp 格式

在材质多的情况下，为了更快加载，更小的图片，往往是有必要的。

**webp** 总能让图片**更小**，也支持透明度

![](/blogs/texture-format/cfda70b67e14b6e8.png)

### 限制

webp 的**转换**可以通过 [cloudconvert
](https://cloudconvert.com/jpg-to-webp)，但是一天数量**有限**（好像是25个）。

其它找不到好用的转换网站。或者只是简单使用 `canvas.toDataURL('image/webp', 0.8)`。

或许我也直接写一个这个方案，放在这里。嗯，就这么办。

写好了：[图片工具](/image-toolbox)

### 转换 App

我还是不喜欢专门安装 app 之类的方案，因为我经常**换电脑**玩 windows/mac/ipad 都在用，不可能为每个设备都安装，还是得线上解决比较好。
