尝试学习一下开源的 **DeepseekHarness** ,然后发现一开始的就是指导学习 **Cordis**

## Cordis

cordis 本身是一个单独的仓库，作者为 **Shigma，gordis 学习笔记 #1**

尝试学习一下开源的 DeepseekHarness ,然后发现一开始的就是指导学习 Cordis

## Cordis

cordis 本身是一个单独的仓库，作者为 [Shigma](https://github.com/shigma) (史一凡)，北京大学出身。聊天机器人框架 **Koishi** 的创始人（2020 年发布）。

- **2022 年 5 月**：Shigma 将 Koishi 内部的插件管理内核抽离出来，做成了独立的元框架 **Cordis**，首次提交在 5 月 18 日左右。Cordis 的 550 个 commit 中，超过 90% 由他一人完成。
- **2023 年**：他撰写了《可逆的插件系统》设计文章，这被视为后来 Cordis 相关学术论文的雏形。
- **2026 年**：Shigma 的名字出现在 DeepSeek V3 技术报告中，猜测他**已入职 DeepSeek**，身份为 DeepSeek-AI 成员。

### DeepSeek Harness 的时间线

- **2026 年 3 月**：DeepSeek 组建 Harness 团队，负责人是**崔添翼**
- **2026 年 5 月**：DSH 内部立项
- **2026 年 8 月 13 日**：
  - Cordis 以 vendor 形式进入 DSH 主仓库；
  - 北京大学与 DeepSeek-AI 联合署名的论文《A Programming Paradigm for Spatiotemporal Composability》发布预印本，**Shigma（Yifan Shi）是第一作者**，崔添翼（Tianyi Cui）是作者之一

## 具体版本

- `1.0.0` 五月 21, 2022
- `2.0.0` 七月 2, 2022
- `3.0.0` 十月 25, 2023
- `4.0.0-alpha.0` 十一月11, 2024
- `4.0.0-rc.12` 十月 22, 2026 (最新）

## 五个核心概念

- **插件是实现 Service 的对象。** 它可以是一个带有可选 `inject` 和 `apply(ctx)` 字段的函数，也可以是一个 `Service` 子类，其生命周期由 Cordis 挂载到当前上下文中。
- **上下文是服务的容器。** 一个服务占据一个稳定的 `ctx.<key>`（如 `ctx.tools`、`ctx.llm`、`ctx.sessions`）；其他插件通过 key 查找服务，而非导入具体实现。
- **通过** `inject` **声明服务依赖。** 插件声明所需的服务后，会等待这些服务就绪才启动；加载顺序通过服务依赖表达，而非手动编排启动序列。
- **类型化事件用于通信。** 服务通过 TypeScript 声明合并注册事件名，然后以 `emit`、`waterfall`（瀑布式事件）、`parallel`、`serial` 或 `bail` 方式分发，分别对应监听者观察、包装、并行扇出、按序执行或停在首个 bail 值。
- **注册是可逆的副作用。** 提示词片段、工具 schema、适配器、提供方和监听器通过 `ctx.effect()` 或 `ctx.on()` 安装，reload 和 teardown 时会按预期撤销。



&nbsp;

&nbsp;