然后看 cordis 1 的 context 部分，这部分承载数据与树形结构

## 拆分内容

根据代码可以拆分为三部分：service 注册服务，state 存储数据，filter 过滤数据

![](/blogs/cordis03/bea09c4e67a0cc4b.webp)

### service

Context class 写了一个静态method：**service**， 这里注册应用级服务，下方写了 2 个基础服务 registry 与 lifecycle，一个是仓库，一个是运行管理

![](/blogs/cordis03/320ca3e6ed524ff6.webp)

注册逻辑为：将 registry 与 lifecycle 写入 Context 的原型上，这里因为 app 没有初始化，所以只是有个指向。指向了，在上篇笔记中 app 初始化时，这里的 symbol privateKey。

### state

这一个 get state，指向了 registry，这个在 plugin 文件中（state 就是以 plugin 为一个单位）。

![](/blogs/cordis03/2c876221993c1c8a.webp)

然后这里的 fork，就是进行 new Context 产生一个，产生一个独有的 ctx 数据。这里需要结合 plugin 中的 state 结构理解。

![](/blogs/cordis03/5dddcd2d9e38fe71.webp)

这里能看出，id，parent，children 代表出的树形结构。其它的数据代表实际业务的内容，using 为依赖，这里的依赖逻辑为：

- 初始化依赖不齐就不执行
- 依赖的任何变化
  - 都会让这个插件重新执行一次
  - 都会让事件重新清理安装一次（除了每个自带的 service）

using 相关内容加上 service 内容就算实现了**热插拔**。

![](/blogs/cordis03/7e99dfab9cd845d7.webp)

### filter

filter 这个几乎只在 context 中使用，只是用来处理数据时过滤。当然这里也是进行树分支的一种方式。

![](/blogs/cordis03/7e99dfab9cd845d7.webp)

### 树形结构

不同 state 进行分支下去。state 又存在同一个 map。

![](/blogs/cordis03/2986782713a1bcfa.webp)

## plugin 文件

plugin 主要时 Registry.plugin 行为：主要 3 部分

![](/blogs/cordis03/78b61366c7afaf07.webp)

1. fork 出一份新 context，区别为 plugin + filter
2. 存入树形数据
3. using 的热插拔功能

### 其它

除了 plugin 功能，其它的一个访问功能，一个 dispose，都比较普通

![](/blogs/cordis03/2528b0d97a392350.webp)

## lifecycle

这个文件是看上去最多，但是逻辑比较易懂的。也分三部分代码：

- 生命周期管理
- 事件注册
- 事件触发

![](/blogs/cordis03/60137d454e84b5c8.png)

### 生命周期

以 tasks 为轴心，以 ready 作为开始，进行循环执行。ready 只执行一次，开始之后，后续就注册 ready 事件就直接执行。

![](/blogs/cordis03/3c08e252bf9b0f6b.webp)

### 事件

事件分为被动触发和主动触发，示例：

```typescript
	const uppercase: Plugin.Object = {
		name: 'uppercase',
		apply(ctx) {
			ctx.on('greeting', text => text.toUpperCase())
		}
	}

	const greeter: Plugin.Object = {
		name: 'greeter',
		apply(ctx) {
			ctx.on('greet', name => ctx.logger.info(`你好，${name}`))
			ctx.on('ready', async () => {
				ctx.emit('greet', 'cordis')
				const text = await ctx.waterfall('greeting', 'hello, cordis')
				ctx.logger.info(text)
			})
			ctx.on('dispose', () => ctx.logger.info('greeter 已销毁'))
		}
	}
```

这里的 text 就主动取出了 greeting 的 hooks 拿出来执行。

## 总览图

![](/blogs/cordis03/3e53cb9f80c5cc64.webp)

