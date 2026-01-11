以管理员身份运行CMD或者Powershell后，输入如下的命令添加一个注册表信息即可：
```
reg add "HKCU\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32" /f /ve
```
运行完之后需要重启系统才能生效，如果不想重启电脑，可以继续运行如下的命令重启explore
```
taskkill /f /im explorer.exe & start explorer.exe
```
如果想要回退成Windows11默认的效果，就需要在cmd或者PowerShell中删除添加的注册表信息，cmd或者PowerShell依然需要以管理员方式运行：

```
reg.exe delete "HKCU\Software\Classes\CLSID\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\InprocServer32" /va /f
```
