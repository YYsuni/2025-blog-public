> Design patterns are a fundamental part of software development, as they provide typical solutions to commonly recurring problems in software design. Rather than providing specific pieces of software, design patterns are merely concepts that can be used to handle recurring themes in an optimized way.

## 1. Singleton Pattern 单例模式

> Share a single global instance throughout our application.

创建一个唯一的实例，提供全局状态

典型步骤：

1. new 一个实例
2. 用 Object.freeze 冻结
3. Export as default

## 2. Proxy Pattern 代理模式

> Intercept and control interactions to target objects.

对外在与 target object 的交互进行管理与拦截

代理模式在状态管理维护上挺好用的，我经常用到的方式是提供一个代理后的 store 对象，假定存储了所有数据，若访问时没有则进行 http 请求，结合 zustand 更新，真的好用。

比如，经典的 Vue data 管理模式，从 Object.defineProperty 到 Proxy/Reflect

## 3. Provider Pattern 空间状态模式

> Make data available to multiple child components.

在声明空间 context 内，子组件对状态进行直接交互

这个方式是相较于 props 传递状态，对于局部（或全局）功能状态管理的更好方式。

相较于 Redux、Vuex、Zustand 一类，React/Vue 提供的原生的状态支持有更好的易用性。在考虑项目的可维护性时，这是值得的。

当然，在 React/Vue Library 实现中，Provider 的传递也是一级级在处理，哈哈！

## 4. Prototype Pattern 原型模式

> Share properties among many objects of the same type.

JS 利用原型链实现继承

JS 继承有多种方式，寄生、盗用、原型以及组合，ES6 的 class 宣告了原型模式成为主流。JS 中的动态类型，我们可以直接去设置 prototype，但一般只在初始化时。

## 5. Container/Presentational Pattern 视图隔离模式

> Enforce separation of concerns by separating the view from the application logic.

单个模块中，将视图展示逻辑独立出来，将展示与组件逻辑分离

View 独立方式，是一个不错的 Refactoring 方向

## 6. Observer Pattern 观察者模式

> Use observables to notify subscribers when an event occurs.

订阅、观察、触发

node.js 中的 event，DOM 中的 listener。前者方便传递信息，后者对交互做出反应，应用很广泛。

## 7. Module Pattern 模块模式

> Split up your code into smaller, reusable pieces

物理上拆分项目文件

AMD 与 CMD 中，传统的同步方式依旧占据绝对优势。模块拆分是成千上万的，异步模块意味着千万请求？异步终究只能是 Application 中的懒加载。

## 8. Mixin Pattern 混合模式

> Add functionality to objects or classes without inheritance.

直接以对象为单位注入功能属性

在过去的 React/Vue 都有流行这个方式，而后被淘汰，确实有些粗鲁了，难以管理

## 9. Mediator/Middleware Pattern 中介着模式

> Use a central mediator object to handle communication between components

多个组件间的通信不便管理，用一个管理平台去处理分发会更好

通常是以后端服务中与多客户端的一个对接模式，前端 axios 的 interceptors 也有类似作用。在 Chrome 插件中也会以 background 来做一个数据服务。

## 10. HOC Pattern 高阶组件模式

> Pass reusable logic down as props to components throughout your application.

将可通用逻辑提取为一个装载组件

像是在 Material UI 中的 styled 行为。像是具有组件形态的 Mixin 模式。

我不太喜欢这个模式，用多了不方便维护，这种模式给我一种嵌套的感觉。代码不应该弄得太过复杂，简单独立会更好维护。

## 11. Render Props Pattern 传递渲染模式

> Pass JSX elements to components through props

将要渲染的组件以属性的形式传入

更好的是作为 children 传入，如 Headless UI 中，将 FC 传入 Listbox.Option 下，会将 Listbox 的状态传入你的业务组件，这是可选的。很契合 JSX 的书写方式，易使用，易拆卸。

## 12. Hooks Pattern

> Use functions to reuse stateful logic among multiple components throughout the app.

可复用的，具有状态的 HOOKs

React Hooks 保留了状态，不再依赖于实例。又能独立空间描述逻辑，成为当下推崇的主流。

自定义 Hook 能自我完全独立，只将状态暴露出来，可拆卸能力真的太好用了。

## 13. Flyweight Pattern 轻量模式

> Reuse existing instances when working with identical objects.

重用实例

当下可使用容量，很少需要顾及到去节省某实例了。更多的是如何安排 packages，达到轻量、最佳的状态。

## 14. Factory Pattern 工厂模式

> Use a factory function in order to create objects.

工厂模式创建实例或对象。（使创建这个行为更方便，更有效率的产出或大或小的 objects）

在这个 React/Vue/Sevlte ，已经生态丰富的时代，前端很少需要自己去创建批量的实例或对象。

在 Library 本身，工厂模式依旧尤为重要。

## 15. Compound Pattern 整合模式

> reate multiple components that work together to perform a single task.

多组件为一个整体。

Headless 的各组件，如 `Listbox context` 下的 `Listbox.Button`、`Listbox.Options`、`Listbox.Option` 能很好的自我协同。

当然这更适合库本身，通常结合 Provider 应用

## 16. Command Pattern 指令模式

> Decouple methods that execute tasks by sending commands to a commander

以指令形式，一条一条执行逻辑

更贴合人类语言，但很少有前端项目这么做吧。这样会以更多的代价，呈现一些对自身没用的指令。