**loader**，简单说就是 cordis 所做 app 的启动的插件配置表，可以再借助 **include** 插件读 **cordis.yml** 配置清单文件。loader 中的单插件单位为 **entry**，entry 可以之间创建，也可以分组 **group**，然后就建立出 **tree**，再一些**隔离**逻辑，就算总览 loader 的总文件。

![](/blogs/cordis-official-01/56a6ffca8e6af6a2.webp)

## 实际需求侧

一个 app，会有设置页，用来启用/配置插件。然后插件会根据功能分组，一起启用/关闭。

这里就涉及：**diff / 热更 / 卸载**

## 配置示例

直接使用为：

```ts
import { Context } from 'cordis'
import Loader from '@cordisjs/loader'
const ctx = new Context()
ctx.baseUrl = import.meta.url
await ctx.use(Loader)
await ctx.loader.create({ id: 'timer', name: '@cordisjs/timer' })
await ctx.loader.create({ id: 'logger', name: '@cordisjs/logger-console' })
await ctx.loader.create({
  id: 'server',
  name: '@cordisjs/group',
  group: true,
  config: [
    { id: 'http', name: '@cordisjs/http', config: { timeout: 10000 } },
    { id: 'static', name: './plugins/static', config: { root: 'data/public' } },
  ],
})
```

而使用 include 插件直接写 yml：

```yml

- id: timer
  name: '@cordisjs/timer'
- id: logger
  name: '@cordisjs/logger-console'
# 一组：HTTP / 静态资源（可整组关）
- id: server
  name: '@cordisjs/group'
  group: true
  config:
    - id: http
      name: '@cordisjs/http'
      config:
        timeout: 10000
    - id: static
      name: './plugins/static'
      config:
        root: data/public
# 多层嵌套
- id: features
  name: '@deepseek-ai/cordis-plugin-group'
  group: true
  config:
    - id: web
      name: '@deepseek-ai/cordis-plugin-group'   # 第二层
      group: true
      config:
        - id: fetch
          name: './plugins/fetch'
        - id: browser
          name: './plugins/browser'
          disabled: true
    - id: chat
      name: './plugins/chat'
```

## 单个配置项 EntryOptions


| 字段          | 含义                                                         |
| ----------- | ---------------------------------------------------------- |
| `id`        | 树内稳定 id；省略则随机。嵌套完整 id 用 `:` 拼，如 `tools:logger`             |
| `name`      | 要 import 的模块（相对路径 / 包名 / 绝对路径）                             |
| `config`    | 传给组件；**group 时必须是子 entry 数组**                              |
| `group`     | `true` → 本条是组，加载 `Group` 组件                                |
| `disabled`  | `true` / `false` / `{ __jsExpr: '...' }`（YAML 里常写成 `!!js`） |
| `inject`    | 本 entry 额外依赖的服务（会包一层 `loader:outer`）                       |
| `intercept` | 叠到 `Context.intercept` 的配置                                 |
| `isolate`   | `{ service: true \| 'label' }` 切开服务命名空间                    |


其实能察觉到 name 这里的命名其实不合适，按语义不该叫 `name` 。

更贴切的名字会是：`module` / `specifier` / `entry` / `url`（有的讲解材料里就改口叫 url）。

### 为什么还叫 name？

历史惯性：早期「插件名 ≈ 包名」（`koishi-plugin-foo`），配置里写 `foo` 就像在点名，于是叫 `name`。后来支持任意路径，语义漂了，API 没改。 

### 其它命名

group 叫 `isGroup` 更合适，config 叫 `children` / `entries` 更合适