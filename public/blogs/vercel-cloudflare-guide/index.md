## 1. 前言

对于很多开发者而言，部署个人博客或项目展示网站时，常常希望流程简单、成本低廉且访问快速。本文将详细介绍如何利用 **Vercel** 进行网站部署，并结合 **Cloudflare** 的免费CDN和DNS服务，实现自定义域名绑定、全球加速及HTTPS安全访问，完美解决Vercel默认域名在国内可能访问不畅或无法访问的问题。整个方案除了域名费用外，其他服务均为免费，非常适合个人用户和小流量项目。

## 2. 工具简介与优势

### 2.1 Vercel
- **是什么**：一个专注于前端项目的云部署平台，支持从Git仓库（如GitHub）自动拉取代码并完成构建和部署。
- **核心优势**：
    - **自动化部署**：关联Git仓库后，每次代码推送可自动触发部署。
    - **免费托管**：提供免费的托管服务及`项目名.vercel.app`的临时域名。
    - **易于绑定域名**：在控制台中可轻松添加自定义域名。

### 2.2 Cloudflare
- **是什么**：全球知名的内容分发网络（CDN）和安全服务提供商。
- **核心优势（免费版已包含）**：
    - **CDN加速**：通过全球节点缓存内容，提升网站访问速度。
    - **DNS解析**：提供稳定可靠的域名解析服务。
    - **SSL证书**：自动为域名签发SSL证书，实现HTTPS加密访问。
    - **DDoS防护**：提供基础的安全防护能力。

### 2.3 域名注册商（如阿里云、Namesilo、Porkbun）
- 负责购买和管理你的自定义域名（例如本教程中的 `hdxiaoke.top`）。
- 选择国外厂商（如Namesilo、Porkbun）通常可以免去实名备案的流程。

## 3. 详细操作步骤

### 3.1 阶段一：将域名托管至 Cloudflare

这是最关键的一步，目的是将域名的解析权从域名注册商转移到Cloudflare。

1.  **添加站点到Cloudflare**
    - 登录Cloudflare控制台，点击“添加站点”（Add a Site）。
    - 输入你购买的根域名（例如 `hdxiaoke.top`），选择免费的“Free”计划。

2.  **修改域名服务器（NameServers）**
    - Cloudflare 会提供两个（或多个）专属的域名服务器地址，形如 `dylan.ns.cloudflare.com` 和 `harmony.ns.cloudflare.com`。
    - **关键操作**：登录你的域名注册商（如阿里云）的控制台，找到域名管理页面，将原有的DNS服务器地址**替换**为Cloudflare提供的那两个地址。
    - **注意**：此更改的全球生效时间可能需要数分钟到48小时，请耐心等待。在此期间，Cloudflare会持续检查，状态变为“Active”即表示成功。

![](/blogs/vercel-cloudflare-guide/6167707842c5c433.webp)

### 3.2 阶段二：在 Cloudflare 配置 DNS 解析

当域名在Cloudflare的状态变为“Active”（激活）后，即可进行解析设置。

1.  在Cloudflare控制台，进入你的域名，点击左侧的 **“DNS”** 选项。
2.  点击 **“添加记录”**（Add record），添加以下两条 **CNAME 记录**（这是连接域名与Vercel的关键）：
    - **记录一（用于 www 子域名）**：
        - **类型（Type）**: `CNAME`
        - **名称（Name）**: `www`
        - **目标（Target）**: `cname.vercel-dns.com` 或你Vercel项目的默认域名（如 `your-project.vercel.app`）。
        - **代理状态（Proxy status）**: 🟠 **橙色云朵（已代理）** - 开启Cloudflare CDN加速与保护。
    - **记录二（用于根域名）**：
        - **类型（Type）**: `CNAME`
        - **名称（Name）**: `@`
        - **目标（Target）**: 同上一记录的目标地址。
        - **代理状态（Proxy status）**: 🟠 **橙色云朵（已代理）** 。

![](/blogs/vercel-cloudflare-guide/7390e751b1edf83b.webp)

### 3.3 阶段三：在 Vercel 绑定自定义域名

现在需要告诉Vercel，当有人访问你的域名时，应该展示哪个网站的内容。

1.  登录 **Vercel** 控制台，进入你的项目。
2.  点击顶部的 **“Settings”（设置）** 选项卡，然后在左侧菜单栏选择 **“Domains”（域名）**。
3.  在输入框中，分别添加你的两个域名并保存：
    - 输入 **`www.hdxiaoke.top`**，按回车。
    - 输入 **`hdxiaoke.top`**，按回车。
4.  Vercel 会自动验证DNS记录。如果配置正确，几分钟后域名状态会显示为绿色的 **“Valid”（有效）** 或 **“Proxy Detected”（已检测到代理）**，这表示绑定成功。

![](/blogs/vercel-cloudflare-guide/233f970aafb556fe.webp)

### 3.4 阶段四：优化配置（可选但推荐）

1.  **配置SSL/TLS**：
    - 在Cloudflare控制台，进入 **“SSL/TLS”** 设置。
    - 将**加密模式**从默认的“Flexible”（灵活）更改为 **“Full (strict)”（完全-严格）**。这能确保从用户到你的源站（Vercel）全程加密，避免可能的重定向循环问题。

2.  **配置重定向（可选）**：
    - 如果你希望访问根域名（如 `hdxiaoke.top`）时自动跳转到带www的域名（如 `www.hdxiaoke.top`），可以在Cloudflare的 **“页面规则”**（Page Rules）中设置一条301重定向规则。

## 4. 测试与访问

完成以上所有步骤后，你的网站就已经配置好了！请打开浏览器，访问以下网址进行测试：
- `https://www.hdxiaoke.top`
- `https://hdxiaoke.top`

如果一切顺利，你现在应该能看到你的网站内容了！

## 5. 总结

通过 **Vercel + Cloudflare + 自定义域名** 的方案，你可以：
✅ **零成本**（仅域名年费）搭建个人网站。
✅ 实现**自定义域名访问**，提升专业度。
✅ 利用Cloudflare的全球CDN节点**优化访问速度**并**解决Vercel默认域名在国内的访问问题**。
✅ 获得**免费的SSL证书**，保障网站安全。

这套组合方案是部署个人网站、博客或前端项目的极佳选择。如果在操作过程中遇到任何问题，可以随时回顾本教程或查阅相关步骤的官方文档。