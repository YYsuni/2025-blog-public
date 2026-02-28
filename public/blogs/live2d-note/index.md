前几天看到一个 blog，说做 live2d，然后我也想试试。很久以前就觉得有意思的，感觉不会难。

* 原 [blog](https://blog.hzchu.top/2026/lxh-websites/#%E8%83%8C%E6%99%AF)
* [罗小黑 blog](https://blog.hzchu.top/2026/lxh-websites/)
* 使用的 github 项目 [pixi-live2d-display](https://github.com/guansss/pixi-live2d-display)
* 在线查看 live2d 文件网站 [Live2D Viewer](https://guansss.github.io/live2d-viewer-web/)

## 过程

看到这个 live2d，感觉植入网站不难，毕竟 sdk 已经做得很完备了。

那现在只缺一个 live2d 文件，应该也不难。

但实际操作下来，还是分成了几天完成一个很简单的效果。因为这个软件操作确实不好理解。

## 制作

通过查询，Live2d 制作软件，有且只有一款：Live2D Cubism Editor, [官网](https://www.live2d.com/zh-CHS/)。这个可以直接个人下载，试用 pro 版本 42 天就行。过期后免费版本好像只有导出分辨率限制。

打开长这个样子，这里新建了模型。（比较恶心的是，打开固定有个启动窗口，然后这个窗口加载巨慢）

![](/blogs/live2d-note/2c2d0de4fe863ab3.webp)

然后可以开始弄了，打开 b站 看教学视频，结果我看了几个感觉不是很好理解。教程比较新的也不多，多少好些年前的视频。

可能是老软件，我理解不了。尝试搜索有没有其它的制作软件，结果没有。

那么，我是前端，不一定非要自己做，想着定制一份吧

### 咸鱼

搜索 *Live2d 模型定制*，然后一通聊下来，至少都是 500 起。

咦，比较贵了，我就先学习为主，花这个价钱花不起。

## 画图

本想着用自己头像做就行，但是教程都是正身图，弄几次失败后，用 AI 生成正身图一点点来。

![](/blogs/live2d-note/bab67a1255a0d0da.webp)

### 拆分

我习惯 figma，但是，figma 做的不行，必须要 ps 做的，然后在 editor 直接打开 psd 才行。

所以这里只能把 figma 用来文件管理

![](/blogs/live2d-note/e82e4505f02225cf.webp)

### PS

下载 ps 比较麻烦，使用还出现了 bug，这里就换成了 [在线PS](https://www.gaoding.com/editor/ps#/)，确实方便多了

然后在 PS 进行进一步拆分处理。

![](/blogs/live2d-note/bab67a1255a0d0da.webp)

这里要**注意**：

* 下半身的脖子要网上多画一节
* 五官全部要单独拆出来

## Editor

在 ps 网站直接 **ctrl s** 会直接保存一份本地文件

然后在 editor 直接打开这个文件，选择低于 5.2 版本，进入后切换 Cubism 4.0 SDK。

![](/blogs/live2d-note/e25e0390577882f7.webp)



