这次直接看看 Cordis4.0-rc.13 版本，为最新版，出现了最新的概念 Fiber

![](/blogs/cordis07/7b6f8186261d431a.webp)

## Fiber

Fiber 是插件实例在运行时的节点，每次 ctx.use() 产生一个。

它更像 React Fiber 树的节点，而不是协程：没有挂起/恢复，也没有调度。

Fiber 持有状态（state、config、committed 依赖快照）和副作用列表（\_disposables），依赖或修订号变化时，由 epoch（目标版本）与 inertia（进行中的过渡）协调卸载重来。

> 改名提交：refa: rename effect to fiber（0eb6772，2025-04-01）

### Effect

类似 useEffect 的"执行 + cleanup"：执行一次，返回可撤销的句柄。

runner 是执行说明（execute / collect / epoch / getOuterStack），**\_execute**(runner) 是统一的执行器；插件体也经由它执行，所以插件 Fiber 可以看作"按 epoch 反复执行的 effect"。

子插件在父 Fiber 眼里也是一个 label 为 `ctx.use()`的 effect。

### Component

rc.12 起 plugin 改名为 component（2026-11-10）：核心包不再导出 Plugin 类型，新增 ctx.use()，ctx.plugin() 成为废弃别名。

可能是为了开发者的**概念对齐**

### 演变

2.0～2.5：State ⇒ Fork / Runtime

2.6～3.18：ForkScope / MainScope  ⇒ EffectScope

4.0-alpha.0：合并为单一 **EffectScope**，Runtime 变成普通对象 

4.0-beta：EffectScope 改名 **Fiber**，scope.ts ⇒ fiber.ts

## 功能与代码

在 4.0-beta 的时候，作为 scope 文件有 400 行了，而在 alpha 时期只有 200 行。最新代码已经是 **500 行**了。为这个项目最大文件，说明这几个版本更替，更新了很多 Fiber 为主的功能。

具体行数：

- 3.18 scope.ts **413** 
- 4.0-alpha.0 **214**（重写）
- 4.0-beta.0 **406** 
- 4.0-rc.13 fiber.ts **557**

## Runtime

**2.0** 出现的 Runtime 作为 state 主要内容，建立 **Runtime - Fork** 主从关系。在 **3.0** 指向 **MainScope**。再到 **4.0** 变成了简易的容器，只承担了容器功能，registry 中每个插件一个，承载插件配置与 fibers

```
runtime = { name, callback, fibers: new DisposableList(), Config: component.Config }
```

Config 是配置的校验/转换函数，配置值保存在各自的 fiber.config 上。

![](/blogs/cordis07/ee817488357fffe9.webp)

