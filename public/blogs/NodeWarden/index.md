## 网页部署

1. Fork `NodeWarden` 仓库到自己的 GitHub 账号
2. 进入  [Cloudflare Workers 创建页面](https://dash.cloudflare.com/?to=/:account/workers-and-pages/create)
3. 选择 `Continue with GitHub`
4. 选择你刚刚 Fork 的仓库
5. 保持默认配置继续部署
6. 如果你打算用 KV 模式，把部署命令改成 `npm run deploy:kv`
7. 等部署完成后，打开生成的 Workers 域名
8. 根据页面提示设置`JWT_SECRET` ，不建议临时乱填。这个值直接关系到令牌签发安全，正式环境至少使用 32 个字符以上的随机字符串。

> [!TIP] 
> 默认R2与可选KV的区别：
>   | 储存 | 是否需绑卡 | 单个附件/Send文件上限 | 免费额度 |
>   |---|---|---|---|
>   | R2 | 需要 | 100 MB（软限制可更改） | 10 GB |
>   | KV | 不需要 | 25 MiB（Cloudflare限制） | 1 GB |


## 更新方法：
- 手动：打开你 Fork 的 GitHub 仓库，看到顶部同步提示后，点击 `Sync fork` ➜ `Update branch`
- 自动：进入你的 Fork 仓库 ➜ `Actions` ➜ `Sync upstream` ➜ `Enable workflow`，会在每天凌晨 3 点自动同步上游。

## 云端备份说明

- 远程备份支持 **WebDAV** 与 **E3**
- 勾选“包含附件”后：
  - ZIP 内仍只包含 `db.json` 与 `manifest.json`
  - 真实附件单独存放在 `attachments/`
  - 后续备份会按稳定 blob 名复用已有附件，不会每次全量重传
- 远程还原时：
  - 会从 `attachments/` 目录按需读取附件
  - 缺失的附件会被安全跳过
  - 被跳过的附件不会在恢复后的数据库中留下脏记录

---

## 导入 / 导出

当前支持的导入来源包括：

- Bitwarden JSON
- Bitwarden CSV
- Bitwarden 密码库 + 附件 ZIP
- NodeWarden JSON
- 网页导入器里可见的多种浏览器 / 密码管理器格式

当前支持的导出方式包括：

- Bitwarden JSON
- Bitwarden 加密 JSON
- 带附件的 ZIP 导出
- NodeWarden JSON 系列
- 备份中心中的实例级完整手动导出

---
来源： https://github.com/shuaiplus/nodewarden