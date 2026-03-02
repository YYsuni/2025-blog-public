# Windows端[^1]

1. 下载并安装[git](https://blog.csdn.net/2301_80035882/article/details/155000175)
2. ~~注册Gitee账号~~（已注册，不用管）
3. 在Gitee网站，点击右上角头像，点击账号管理，左侧边栏划到SSH公钥
4. 根据网站上的[提示](https://help.gitee.com/base/account/SSH%E5%85%AC%E9%92%A5%E8%AE%BE%E7%BD%AE)通过git bash生成公钥并粘贴到Gitee的SSH公钥(存在Bitwarden里了)网页上
5. 在Gitee上新建一个仓库，选择私有，其余自便
6. 点击初始化readme文件，点击右上角克隆下载，复制“下载代码请复制以下命令到终端执行”下面的那一行代码。
7. 选择好自己存放笔记的文件夹，在文件夹里面右键，选择“open git bash here”并粘贴上一步复制的代码并执行
8. 在弹出的登录界面中输入登录Gitee的账户和密码
9. 在obsidian中将刚刚clone下来的仓库作为新的库，下载git插件
10. 在插件设置中，
    - 启用Auto backup after file change
    - 设置Auto commit interval(minutes)为n：停止编辑n分钟后触发本地提交
    - 启用Auto push interval(minutes)并设为n：远程推送间隔也设为n分钟
    - 勾选Auto pull on startup
11. 在仓库目录中新建.gitignore文件，填写同步时需要忽略的项（也可在obsidian里面同步前在插件中进行设置，还更清楚格式）
    - 强烈建议！！！在配置好.gitignore前不要进行任何一次同步
    - .gitignore配置可参考已经弄好的，总之就是直接标的是忽略，前面加个!是保活

---

# Android端[^2]

把Windows端obsidian整个仓库打包压缩，发到手机，解压到Android/data/md.obsidian里面的地址，然后按需开关插件

---

# Q&A

- 开启2FA后无法同步了？[^3]

  1. 新建私人令牌（存在Bitwarden里），即PAT

  2. 在obsidian仓库文件夹中右键git bash

  3. 输入

     ```
     git remote set-url origin https://你的Gitee用户名:你的PAT@gitee.com/你的用户名/obsidian-main.git
     ```

---

# 参考

[^1]: https://www.bilibili.com/video/BV1mmUPB2EEQ/
[^2]: https://www.bilibili.com/video/BV1qCh9zrEKq/
[^3]: https://chatglm.cn/share/lF1kf82V