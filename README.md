# 控糖生存指南

一个以生活选择为核心的控糖健康科普互动游戏。

- 网页版：仓库根目录的 Next.js 项目
- 微信小程序版：[`miniapp/`](./miniapp/README.md)

两个版本放在同一个仓库中，互不影响。昵称、挑战进度和个人复盘只保存在用户自己的微信本地存储中；小程序通过云开发上报不含昵称和健康数据的匿名行为事件，用于汇总数据看板。

- [云开发统计部署说明](./miniapp/CLOUD_ANALYTICS_SETUP.md)
- [题库与数值 v8 更新记录](./docs/game-data-v8-release-notes.md)
