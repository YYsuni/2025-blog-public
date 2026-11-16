Cordis 4.0 目前都是 alpha,beta,rc 版本，跨度时间代码改动也比较大。如果按照以前的发版风格的话，可以直接分为 4.0, 5.0, 6.0 也不为过。但是这次的版本就一直收敛在 4.0。

所以开始看 4.0.0-alpha.0 版本

![](/blogs/cordis06/1cfedc05d4880545.webp)

## Context

context 进一步划分，proxy 直接单独出去一个大文件 **reflect.js**

## Registry

registry 多了 inject 原型方法，还多了一个 Inject 独立装饰器方法

## Scope

统一为了 EffectScope，restart 只是切换状态

![](/blogs/cordis06/6ca19a2d5f2144ea.png)

## Events

移除了 start/stop，new Context 就已经自动运行了。

