3.0 相比 2.0 代码量变化不大，但是更加规范了起来，更井井有条的感觉。

![](/blogs/cordis05/b1a0cbeaa3ea6209.webp)

概览来看，还是主要 4 个文件 + 推荐基类。然后名字上进行了一些迁移。

## Context

context 调整较大

- Object.defineProperty(this.prototype 改为了 Proxy + get

![](/blogs/cordis05/bb986eb39baf796f.webp)

- 服务注册也规范划分了 `mixin` + `provide` 
- 隔离又新加了共享：`mapping` → `shadow` + `realms`
- Symbol 名称规范了 `Symbol.for('cordis.*')`

![](/blogs/cordis05/60ed302925372d47.webp)

## Registry

3.0 的 registry 更简约纯粹了，去除了 2.0 中的 dispose，也去除了 validate。

![](/blogs/cordis05/c58a51b7f0b2b59b.webp)

关键的 map 继承也改为了内置一个 map。root.state 改为了 root.mainScope

## Scope

原 state，现在新内容分为：EffectScope、ForkScope、MainScope。

但 plugin 的逻辑还是维持 new MainScope, 然后 mainScope.fork 返回。

2.0 的 state 逻辑集中在 Runtime，3.0 的逻辑主要集中在 EffectScope 身上。

![](/blogs/cordis05/a355a0ea1f41dc60.webp)

如图，基类 EffectScope 新增了很多字段，之前只有 `uid` `context` `config` `parent`,清理用的 `disposables` 。现在 `runtime` 也放在了基类。新增了 `tasks` `status` `error` `hasError` ，多了这些是因为 3.0 apply 支持异步，异步代表还有执行内容会处于某个状态。

而 `acceptors` 是给外部业务设置 `decline` ,光看 cordis 无法说明。

然后 restart 改为了 reset + start 两个行为

![](/blogs/cordis05/2febca180b90dfe7.webp)

## Event

原 lifecycle,  统一了事件前置处理 `prepareEvent` ，删除了 queue，改为了 `context.scope.ensure` , event 这边只保留**副本**，具体启动/异步的生命周期状态由各 `scope.tasks` 管。

## 总结

这次改版应该是一次 cordis 功能规范改造。集中在 Context 和 Scope，Context 规范化，Scope 聚拢了执行。

