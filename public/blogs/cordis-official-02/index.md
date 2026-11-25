官方 cordis 教程总体下确实轻松，但是一一下来，也有不少回归感受。这次就提炼下我所解惑的笔记吧。

## 记

- 教程都是以 `node --import tsx ../../vendor/cordis/bin.js` 执行

这样启动简单的 cordis + loader + include 使用教程目录的 yml

- dsh 目前使用的 cordis **rc-12**，所以还没有 Component 概念，plugin 在 rc13 才替换为 use 推荐



- Service class 其实更为了是 ctx 服务注册，顶层单例
- yml 写的文件默认就导出 **default**，通常不写，那么就是整个**命名空间**作为 object 插件

所以插件文件，就已经是一个 fiber 注册进去，文件内注册插件就是子 fiber，可以继承这个 fiber 的 isolate/intercept 等

- Fiber = 某次 `plugin()` 跑起来的生命周期容器。
- Service = 在某个 Fiber 上 `provide` 出去的具名能力

Service 类本身也可以当插件挂，从而「自带一个 Fiber」。



- ctx.plugin 与 ctx.registry.plugin 有第三参数的不同，getOuterStack，用来修改报错 stack
- effect 写出来会立即执行，而不是等下轮执行。

react 中的 useEffect 会在 commit + paint 之后执行，底层通常是 `MessageChannel.postMessage`（不行再退 `setTimeout`），不是 `queueMicrotask` / `Promise.then`。微任务会在当前任务末尾、paint 之前跑完；passive 故意推到 paint 之后。

## DSH 目录文件

### 产品本体


| **路径**      | **干什么**                                                                                                             |
| :----------- | :------------------------------------------------------------------------------------------------------------------- |
| `packages/` | **主体**。所有 `@deepseek-ai/dsh-*` 能力包，按能力分组：`core`（会话/agent loop）、`llm`、`shell`/`fs`、`session`、`client`/`host`、`sdk` 等 |
| `apps/`     | 可交付应用：`web`、`desktop`、`cli`，以及桌面宿主/发布相关                                                                             |
| `vendor/`   | 钉死的 Cordis / loader 源码副本（插件运行时底座）                                                                                   |
| `python/`   | Python SDK / 运行时                                                                                                    |
| `native/`   | Node 原生 addon 源码                                                                                                    |


### 文档


| **路径**                       | **干什么**                 |
| :---------------------------- | :----------------------- |
| `README.md` / `README.zh.md` | 项目入口（怎么跑）               |
| `docs/`                      | 架构、开发、子系统、cookbook、用户指南 |
| `AGENTS.md`                  | 给 AI/贡献者的仓库公约（根规则）      |
| `CLAUDE.md`                  | 软链到 `AGENTS.md`         |
| `CONTRIBUTING*.md`           | 贡献流程                    |
| `SAFETY*.md`                 | 安全说明（跑 agent 前该看）       |
| `BRAND_GUIDELINES*.md`       | 品牌规范                    |
| `*.i18n.yaml`                | 中英文档对齐用的元数据，**不是业务代码**  |


### 工程脚手架（可当“背景噪音”）

#### 包管理 / 构建

- `package.json`、`pnpm-workspace.yaml`、`pnpm-lock.yaml` — monorepo 根
- `Makefile` — `web` / `desktop` 等快捷命令
- `tsconfig*.json` — Host / Client 两套 TypeScript 聚合工程（这是根目录 tsconfig 很多的原因）
- `tsdown.config.ts` — 打包产物
- `patches/` — pnpm 依赖补丁
- `.dsh-build/`、`*.tsbuildinfo`、`tmp/`、`node_modules/` — 本地生成物，不用当源码读

#### 测试

- `vitest*.config.ts` / `vitest.shared.ts` — 单元 / e2e / snapshot / web / bench 分轨
- `pytest.ini` — Python 测试
- `snapshots/` — 无 key 的录制会话回放（产品可见行为回归）
- `benchmarks/` + `BENCHMARK.md` — 性能门禁

#### 质量与 CI

- `scripts/` — 几百个门禁/生成脚本（文档同步、依赖检查、覆盖率策略等）
- `lefthook.yml` — git hooks
- `.oxlintrc*.json`、`.prettierrc`、`.editorconfig`、`.jscpd.json` — lint/格式/克隆检测
- `.github/`、`.gitlab-ci.yml` — CI
- `.gitignore`、`.gitattributes`、`.rgignore`

#### Agent / 协作工具

- `.agents/` — skills、决策笔记（Agent Notes）
- `.claude/` — Claude 相关本地配置

#### 法务 / 站点

- `LICENSE`、`THIRD_PARTY_NOTICES.md`
- `website/` — VitePress 文档站

