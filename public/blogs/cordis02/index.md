Cordis 1.0，代码量不多，我来看去总是不明所以的。经过几天多次的零散的浏览，有了一些感受。

## 诞生

直接看 Cordis 1.0，奇怪的感觉很多。后来通过使用方的角度去尝试了下，发现问题在于 1.0 的不完善。

- C1 的来源，是在 Koishi 4.7.1 才出现，在 core 的文件中引入
- 引入的时候，使用依旧不是很规范，有很多专有的东西直接植入

所以能感受到，如果单一不了解 Koishi 的时候去看，会很懵逼。

### Koishi

我尝试下载 Koishi，发现不能直接使用，需要看教程通过开放平台绕圈子在 QQ 中使用。只能通过代码层面稍微分析它的使用。

## Cordis 代码

cordis 仓库没有 v1.0 的代码，只能通过 npm 找到 1.0 的编译代码。反编译后，只有 4 个文件。 

![](/blogs/cordis02/3c551487cbae5906.webp)

app / context / plugin / lifecycle，内容较多为 plugin/lifecycle

![](/blogs/cordis02/33f05c65ade401fe.webp)

## app.js

app 只有一个启动壳子，只用来对外暴露和寄生服务。

![](/blogs/cordis02/bb64e52cd47e00ec.webp)

- 光看 app 的代码，几乎是一头雾水，因为它并没有自己的逻辑，这些代码需要去其它服务里看
- 我们先看 super 了什么

![](/blogs/cordis02/d7eefa8f69b5af94.webp)

这里明显的看到，super 只是一个初始化自身赋值，这里算是什么都没有初始化。

- 进一步看 filter 是干嘛的，为什么 `() => true`

![](/blogs/cordis02/acb1ae79a40da6ea.webp)

全局搜索 filter，发现 filter 只在 context 里面使用，它这里的功能，就是给插件用的，app 自身是个不用空插件所以不需要设置这些。

- `this.app = this`

这里是因为，Context ts 中内置声明了 app, lifecycle, registry，这里希望继承，但是又不是真的继承关系，而是使用了 `Object.defineProperty` 去注入**应用级服务**

```ts
interface Services {
        app: App;
        lifecycle: Lifecycle;
        registry: Registry;
    }
```

> 应用级服务，代表整个插件体系，都能直接访问这些服务

- `this.options = Registry.validate(App, config)`

这个只是挂初始化的 config，没有任何配置，具体 `Registry.validate` 为：

```javascript
static validate(plugin, config) {
		if (config === false) return
		if (config === true) config = undefined
		config ??= {}

		const schema = plugin['Config'] || plugin['schema']
		if (schema) config = schema(config)
		return config
	}
```

这个只是自己校验自己，而我们只看代码，所以相当于`this.options=options` , 而 options 的配置，目前只有**Lifecycle**里面的 `maxListeners` 设置。

- for 的赋值，就是**应用级服务**的挂载，在这里初始化服务的 `class` ,这里进行匿名实例化一次，实际 service 真名注册是用的 `Context.service` ，然后进行监听数据变化设置：

```javascript
export class Context {
  static service(name, options = {}) {
		if (Object.prototype.hasOwnProperty.call(Context.prototype, name)) return
		const privateKey = typeof name === 'symbol' ? name : Symbol(name)

		Object.defineProperty(Context.prototype, name, {
			get() {
				const value = this.app[privateKey]
				if (!value) return
				defineProperty(value, Context.current, this)
				return value
			},
			set(value) {
				const oldValue = this.app[privateKey]
				if (oldValue === value) return
				this.app[privateKey] = value
				if (typeof name !== 'string') return
				this.emit('service', name, oldValue)
				const action = value ? (oldValue ? 'changed' : 'enabled') : 'disabled'
				this.emit('logger/debug', 'service', name, action)
			}
		})

		if (options.constructor) {
			Context.internal[privateKey] = options.constructor
		}

		for (const method of options.methods || []) {
			defineProperty(Context.prototype, method, function (...args) {
				return this[name][method](...args)
			})
		}
	}
}
```

这里进行了 privateKey 匿名 symbol，然后进行 get 时赋予 **服务** `Context.current` ,用来取得正在使用的 ctx

> 这里为什么要用 current，也是因为这里的代理 method 问题，子集插件访问 this.\[name\] 的时候，this 回到了根节点的服务，导致 ctx 回到了根 app，这样 state 访问就会错误

- 最后的 start, stop 就是 lifecycle 的内容了



&nbsp;