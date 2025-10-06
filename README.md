# workwxbot_class_schedule
企微机器人推送课表
# 前提条件
1. 需要一份准备好的ics文件（通用日历格式）
2. 需要企业微信机器人WebHook地址 
3. 需要安装NodeJS
4. 一个聪明的大脑
# 使用方法
1. 在一个空文件夹创建上述脚本，并修改webhook地址
2. 准备你的ics文件将其改名为 **kebiao.ics** 放在 **Workers.mjs** 相同的文件夹下
3. 运行脚本
```bash
node Workers.mjs
```
就这么简单，可能从哪里搞ics文件比较有难度，不过直接把你的课表喂给ai生成即可
