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

