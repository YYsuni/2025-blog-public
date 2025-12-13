## Next.js 的 Canary
在看 [next.js](https://github.com/vercel/next.js) 的仓库的时候，发现它没有 main/master 分支，而有的是一个 canary 分支。版本号中时常会出现 canary 字样。这引起了我的兴趣。

![](/blogs/canary-version/b60c0eab76e17860.webp)

通过观察，next.js 的 PR 会 采用 `Squash and Merge` 并删除已合并分支。新版本将会从 xxx-canary.0 开始，在一定测试修复后，正式发布版本号。目前并不清楚的是它的变更时期，以及成为正式版本的标准是什么。

在我过去管理的版本中，我加入新东西，会更新一个 Patch 版本。然后使用中发现一些问题，修复后又发布，就会需要马上又不得不更新一个 Patch 版本。而这个版本目的也只是为了修复上个版本中的问题。就是这个较为随意的举动，导致存在一些不可用的版本。

> **MAJOR.MINOR.PATCH**

有了这个 canary 阶段后，就能明显的改善这个问题。也督促我不要随意的发布一个新的版本号，需要足够的时间，足够的测试才行。

如何发布一个 canary 版本：

```bash
npm publish --tag canary
```

## Canary 的由来

它起源于煤矿工人使用金丝雀作为早期检测系统来识别有毒气体的危险程度。

1911 年，英国的矿工们开始把金丝雀带入矿井。这些小鸟对一氧化碳非常敏感，微量的一氧化碳泄露就会让它们焦躁、啼叫甚至死亡。如果金丝雀产生剧烈反应，矿工便知道井下有危险气体，需要撤离。

慢慢地，金丝雀版本可以代表着软件的早期检测和反馈。

## 实践

在新版的 [react18-json-view](https://www.npmjs.com/package/react18-json-view?activeTab=versions) 中，我便开始采用这种模式，一个版本以 canary 版本开始，经过一定的 canary 版本后，进行正式的更替。

## 版本规范

[**Semantic Versioning 2.0.0**](https://semver.org/)

> Given a version number MAJOR.MINOR.PATCH, increment the:
>
> 1. MAJOR version when you make incompatible API changes
> 2. MINOR version when you add functionality in a backward compatible manner
> 3. PATCH version when you make backward compatible bug fixes
>
> Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format.

我觉得，minor 版本应该是积累了一定的功能后，进行的一次追加。通常情况下依旧是追加 patch 版本号，即使这次的 patch 中添加了一些功能。比如，next.js 的 minor 版本变更：

![](/blogs/canary-version/21a21c957999c84d.png)