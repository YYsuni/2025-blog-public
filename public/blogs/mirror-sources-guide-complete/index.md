# 我跟镜像源不得不说的那些事

## 前言

作为一名（奇妙网络环境下的）开发者，`pip install` ，`docker pull` ，`conda install`，`nvm install`，`npm/pnpm/yarn/cnpm install` 很眼熟吧。是不是总是莫名其妙的卡住，这些问题很大程度上都是由于当前网络被某种镜像源毙掉了！

## 什么是镜像源？

镜像源（Mirror Source）是指将原始软件仓库的内容完整复制到国内服务器上，形成的一个"镜像"。当我们访问镜像源时，实际上是在访问国内的服务器，从而大大提升下载速度和稳定性。

常见的镜像源包括：
- **包管理器镜像源**：pip、conda、npm、yum等
- **系统镜像源**：Ubuntu、CentOS、Debian等Linux发行版
- **容器镜像源**：Docker Hub、GitHub Container Registry等
- **开发工具镜像源**：Maven、Gradle等

## Conda 镜像源配置

### 官方源下载地址（推荐！起码最新！）

Anaconda官方源地址：`https://repo.anaconda.com/archive/`
避免国内某些高校镜像源还处于远古版本（问就是被祸害了）
nvm 国内官方源地址：`https://nvm.uihtm.com/doc/download-nvm.html`
### 配置步骤

#### 1. 初始化 Conda

如果你还没有初始化conda，首先需要执行：

```bash
conda init
```

#### 2. 添加国内镜像源

以清华大学镜像源为例：

```bash
# 添加主镜像源
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/r
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/pro
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/conda-forge

# 设置搜索时优先使用镜像源
conda config --set channel_priority strict
```

#### 3. 验证配置

查看当前配置的镜像源：

```bash
conda config --show channels
```

#### 4. 清理配置（如需重置）

如果需要恢复到默认配置：

```bash
conda config --remove-key channels
```

### 常用 Conda 镜像源

| 镜像源 | 地址 | 特点 |
|--------|------|------|
| 清华大学 | https://mirrors.tuna.tsinghua.edu.cn/anaconda/ | 速度快，更新及时 |
| 中科大 | https://mirrors.ustc.edu.cn/anaconda/ | 稳定可靠 |
| 阿里云 | https://mirrors.aliyun.com/anaconda/ | 企业级服务 |
| 华为云 | https://mirrors.huaweicloud.com/anaconda/ | 新兴镜像源 |

## Linux 系统镜像源配置

### 一键换源脚本

对于Linux系统，我们可以使用一键换源脚本来快速配置：

```bash
bash <(curl -sSL https://linuxmirrors.cn/main.sh)
```

## Docker 镜像源配置

### 一键配置脚本

```bash
bash <(curl -sSL https://linuxmirrors.cn/docker.sh)
```

### pip 镜像源

```bash
# 临时使用
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple package_name

# 永久配置
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```
---

## 一、npm 镜像源配置

### 1. 设置淘宝镜像（永久生效）

```bash
npm config set registry https://registry.npmmirror.com
```

### 2. 验证配置是否生效

```bash
npm config get registry
# 应输出：https://registry.npmmirror.com
```

### 3. 临时使用（单次命令）

```bash
npm install --registry https://registry.npmmirror.com
```

### 4. 还原官方源（如需）

```bash
npm config delete registry
# 或显式设回官方源
npm config set registry https://registry.npm.org
```

---

## 二、NVM 镜像配置（加速 Node.js 下载）

NVM 默认从 `https://nodejs.org/dist` 下载 Node.js，国内访问慢。可配置镜像加速。

---

### 🖥️ Windows（使用 [nvm-windows](https://github.com/coreybutler/nvm-windows)）

1. 打开 **PowerShell 或 CMD**
2. 设置环境变量（永久）：

```powershell
# 设置 Node.js 镜像
[Environment]::SetEnvironmentVariable("NVM_NODEJS_ORG_MIRROR", "https://npmmirror.com/mirrors/node", "User")

# 可选：设置 npm 镜像（nvm install 后自动配置 npm）
[Environment]::SetEnvironmentVariable("NVM_NPM_MIRROR", "https://npmmirror.com/mirrors/npm", "User")
```

3. **重启终端**，然后测试：

```bash
nvm install latest
```

> 镜像地址说明：
> - Node.js 镜像：`https://npmmirror.com/mirrors/node`
> - npm 镜像：`https://npmmirror.com/mirrors/npm`

---

### 🐧 Linux / 🍏 macOS（使用 [nvm-sh/nvm](https://github.com/nvm-sh/nvm)）

1. 编辑你的 shell 配置文件（如 `~/.bashrc`、`~/.zshrc` 等）：

```bash
nano ~/.zshrc   # 或 ~/.bashrc
```

2. 在文件末尾添加以下环境变量：

```bash
export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node
export NVM_NPM_MIRROR=https://npmmirror.com/mirrors/npm
```

3. 保存并生效配置：

```bash
source ~/.zshrc   # 或 source ~/.bashrc
```

4. 测试安装：

```bash
nvm install --lts
```

---

### Maven 镜像源

在 `~/.m2/settings.xml` 中添加：

```xml
<mirrors>
  <mirror>
    <id>aliyunmaven</id>
    <mirrorOf>*</mirrorOf>
    <name>阿里云公共仓库</name>
    <url>https://maven.aliyun.com/repository/public</url>
  </mirror>
</mirrors>
```

## 显卡驱动相关命令

在配置开发环境时，显卡驱动的检查也很重要：

```bash
# 检查显卡硬件信息
lspci | grep -i nvidia

# 检查NVIDIA驱动状态
nvidia-smi

# 查看驱动版本
nvidia-smi --query-gpu=driver_version --format=csv
```

# 镜像站推荐列表

## 🏢 企业站
| 名称 | 地址 |
|------|------|
| 网易 | https://mirrors.163.com |
| 搜狐 | http://mirrors.sohu.com |
| 阿里云 | https://mirrors.aliyun.com |
| 首都在线科技股份有限公司 | http://mirrors.yun-idc.com |
| 华为云 | https://mirrors.huaweicloud.com |
| 腾讯云 | https://mirrors.cloud.tencent.com |
| 平安云 | https://mirrors.pinganyun.com |
| 开源社/Azure中国 | http://mirror.azure.cn |
| OpenTuna/AWS中国 | https://opentuna.cn |

## 🎓 教育站
| 名称 | 地址 |
|------|------|
| 中国科技大学 | https://mirrors.ustc.edu.cn |
| 清华大学 | https://mirrors.tuna.tsinghua.edu.cn |
| 北京外国语大学 | http://mirrors.bfsu.edu.cn |
| 北京交通大学 | https://mirror.bjtu.edu.cn |
| 北京理工大学 | http://mirror.bit.edu.cn/web |
| 兰州大学 | http://mirror.lzu.edu.cn |
| 上海交通大学 | http://ftp.sjtu.edu.cn |
| 大连东软信息学院 | http://mirrors.neusoft.edu.cn |
| 浙江大学 | http://mirrors.zju.edu.cn |
| 重庆大学 | http://mirrors.cqu.edu.cn |
| 南阳理工学院 | http://mirror.nyist.edu.cn |
| 中科院高能物理研究所 | http://mirror.ihep.ac.cn |
| 西北农林科技大学 | https://mirrors.nwafu.edu.cn |
| 华中科技大学 | http://mirror.hust.edu.cn |
| 大连理工大学 | http://mirror.dlut.edu.cn |
| 山东女子学院 | http://mirrors.sdwu.edu.cn |
| 西安交通大学 | https://mirrors.xjtu.edu.cn |
| 上海交通大学SJTUG | https://mirrors.sjtug.sjtu.edu.cn |
| 南京邮电大学 | http://mirrors.njupt.edu.cn |
| 南京大学 | http://mirrors.nju.edu.cn |
| 同济大学 | https://mirrors.tongji.edu.cn |
| 华南农业大学 | https://mirrors.scau.edu.cn |
| 东莞理工学院 | https://mirrors.dgut.edu.cn |
| 重庆邮电大学 | http://mirrors.cqupt.edu.cn |
| 云南大学 | http://mirrors.ynuosa.org/index |
| 哈尔滨工业大学 | https://mirrors.hit.edu.cn |
| 南方科技大学 | https://mirrors.sustech.edu.cn |

## 📦 其他专用镜像
| 类型 | 名称 | 地址 |
|------|------|------|
| 综合 | 常州贝特康姆软件技术有限公司(公云PubYun) | http://centos.bitcomm.cn |
| Python | 豆瓣pypi | http://pypi.doubanio.com |
| Python | v2ex的pypi | http://pypi.v2ex.com |
| NPM | 淘宝NPM | https://npm.taobao.org |
| Ruby | Ruby China的RubyGems | https://gems.ruby-china.com |
| Maven | 淘宝TAEMaven仓库镜像 | http://mvnrepo.tae.taobao.com/content/groups/public |
| Maven | 阿里云Maven仓库镜像 | http://maven.aliyun.com/nexus/content/groups/public |
| Maven | 阿里云Jcenter仓库镜像 | http://maven.aliyun.com/nexus/content/repositories/jcenter |
| 综合 | LinuxEye | http://mirrors.linuxeye.com |
| 综合 | 移动云镜像站 | http://mirrors.bclinux.org |
| 综合 | Cloud-Stack镜像站 | http://mirrors.cloudstack-china.com |
| 综合 | cn99(常州贝特康姆旗下) | http://mirrors.cn99.com |
| 龙芯 | 龙芯开源社区 | http://mirrors.loongnix.org |
| 教育 | 英荔教育 | https://mirrors.e-ducation.cn |
| JDK | injdk.cn的各版本JDK镜像 | https://www.injdk.cn |
| Go | 百度Go Module仓库代理 | http://goproxy.baidu.com |

## 🏆 推荐使用（综合性能较好）
1. **清华大学镜像站** - https://mirrors.tuna.tsinghua.edu.cn
2. **中科大镜像站** - https://mirrors.ustc.edu.cn  
3. **阿里云镜像站** - https://mirrors.aliyun.com
4. **腾讯云镜像站** - https://mirrors.cloud.tencent.com

## 💡 使用建议
- **开发环境**：推荐使用清华或中科大镜像，更新及时，覆盖全面
- **生产环境**：建议使用阿里云、腾讯云等企业级镜像，稳定性更高
- **特定语言**：根据开发语言选择专用镜像（如NPM用淘宝，Ruby用Ruby China）
- **地理位置**：选择离自己地理位置较近的镜像站，速度更快