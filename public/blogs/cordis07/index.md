这次直接看看 Cordis4.0-rc.13 版本，为最新版，出现了最新的概念 Fiber

## Fiber

进程 =&gt; 线程 =&gt; 协程，这里 Fiber 就相当于协程，有独立的运行，有父子级关系。

像是 React 的 Fiber，但没那么复杂。Cordis 的 Fiber 有自己 effects，然后这里的 Effect 又是真正的执行单位，修改数据 + 卸载清理。

### Component

与 Fiber 同时出现的，就是 component 的概念，Fiber + component 概念对于前端来说，就很亲切了。然后插件 plugin 这个概念就在消失，或者说 component 在 cordis 就是插件的意思了。

可能是为了开发者的**概念对齐**，所有将之前的 EffectScope 这些说法改为了更技术通用的 Fiber 概念。

## Effect

类似 useEffect，为独立的执行单元。执行又通过 runner 清单对象传输给 **\_execute**(runner) 执行。

## 功能与代码

在 4.0-beta 的时候，作为 scope 文件有 400 行了，而在 alpha 时期只有 200 行。最新代码已经是 **500 行**了。为这个项目最大文件，说明这几个版本更替，更新了很多 Fiber 为主的功能。

## Runtime

2.0 出现的 Runtime 作为 state 主要内容，建立 Runtime - Fork 主从关系。在 3.0 指向 MainScope。再到 4.0 变成了简易的容器，只承担了容器功能，承载插件配置与 fibers

```
runtime = { name, callback, fibers: new DisposableList(), Config: component.Config }
```

