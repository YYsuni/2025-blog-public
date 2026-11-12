> 思维导图笔记已放置文章末尾，请在 [https://linkmind.art/](https://linkmind.art/) 网站中打开

嗯 \~ ，2.0 Cordis 的设计，只从代码上看，依旧不是很能深刻理解各种设计的原因，所以这个就理解完全部代码，从功能性和数据结构性去总结一下。

## 定义

Cordis2.0 是一款以 `Context` 为唯一根的插件运行时：用原型链派生作用域，用 `Runtime`/`Fork` 管理插件生命周期，用 `Lifecycle` 做事件与启停，用 Symbol 服务表（可 `isolate`）做依赖注入。

这一句话依旧会让人听得云里雾里的。我们再从功能角度去探索看看吧。

## 1. 应用根与上下文

- `new Context(config)` 启动根
- `extend(meta)` 派生子上下文（原型链盖一层 Meta）
- `isolate(names)` 隔离指定服务的 Symbol

![](/blogs/cordis04/d967d57488189f74.webp)

Cordis 特别喜欢利用 js 中的原型链，无论是 mapping 还是 state 都是用原型链隔离

## 2. 插件加载

- 支持三种形态：函数 / 构造类 / `{ apply }` 对象
- `ctx.plugin(plugin, config?)` 加载，返回 **Fork**
- 同插件可多次挂载（Runtime 一份 + 多个 Fork）
- `reusable`：每次 Fork 整段重跑
- 类实例可选 `fork(ctx, config)`：共享实例 + 每挂载再执行
- `using: string[]`：依赖服务齐了才真正 apply/restart

![](/blogs/cordis04/cf7e30e219454d03.webp)

## 3. 生命周期与卸载

- Fork / Runtime 的 `dispose`、disposables 收集清理
- `app.start()` / `app.stop()`（ready / 根清理）
- 配置 `update`（热更相关）

## 4. 服务（DI）

- `Context.service(name)` 声明服务槽（getter → root\[Symbol\]）
- mixin：把服务的 methods/properties 挂到 Context 上
- `Service` 基类：ready 挂载、dispose 卸载；`immediate` 可提前挂上 ctx

服务的管理使用的是：真实数据放入 app 实例用 symbol 匿名，然后在原型上管理关口

## 5. 事件总线

- `on` / `once` / `off`
- 派发：`emit` / `parallel` / `serial` / `bail`
- 特例通道：`ready`、`dispose`、`fork`（经 `internal/hook`）
- 可选 `thisArg` + `Context.filter` 过滤监听方
- 内部事件：`internal/service`、`internal/fork`、`internal/runtime`、`internal/update`、`internal/warning` 等

