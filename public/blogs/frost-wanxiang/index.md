将这一段内容放在方案文件（rime_frost_double_pinyin_flypy.custom.yaml）中，[下载模型](https://github.com/amzxyz/RIME-LMDG/releases) 到rime的用户目录，将language:amz-v2n3m1-zh-hans 改成下载的文件名（不包含后缀）,重新部署即可使用！

```
__include: octagram   #启用语法模型
#语法模型
octagram:
  __patch:
    grammar:
      language: wanxiang-lts-zh-hans  
      collocation_max_length: 5
      collocation_min_length: 2
    translator/contextual_suggestions: true
    translator/max_homophones: 7
    translator/max_homographs: 7
```

