1. 打开 C:\Users\你的用户名\AppData\Local\Programs\utools\resources\app-update.yml 这个文件，删除 url： 后面那个网址。然后退出，右键yml，属性，把这个文件设为“只读”权限。
2. 打开 C:\Windows\System32\drivers\etc\hosts，在结尾添加上127.0.0.1 update.u-tools.cn、127.0.0.1 res.u-tools.cn、0.0.0.0 publish.u-tools.cn
3. 打开 C:\用户\当前用户名\AppData\Local\utools-updater ，点进去，删掉里面的所有东西。然后右键属性 → 安全 → 编辑，给安装了utools的用户组勾上“写入 - 拒绝”这个方框。