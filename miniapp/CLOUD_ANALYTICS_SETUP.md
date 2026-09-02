# 控糖生存指南：云开发统计开通步骤

这套统计不需要玩家登录，也不会上传昵称、头像、手机号或真实健康数据。

## 一、创建云开发环境

1. 用微信开发者工具打开 `miniapp` 项目。
2. 点击顶部工具栏或左侧的「云开发」。如果没有看到，先点击工具栏右侧的「更多」。
3. 点击「开通」或「创建环境」。
4. 环境名称可以填写：`控糖生存指南`。
5. 套餐先选择控制台当前提供的最低档或免费体验档；具体额度和价格以创建页面显示为准。
6. 创建完成后，复制类似 `cloud1-xxxx` 的「环境 ID」。环境名称不是环境 ID。

请不要复制或发送 AppSecret、密钥、密码。环境 ID 本身可以用于小程序配置。

## 二、把环境 ID 填进项目

打开 `src/config/cloud.ts`，把：

```ts
export const CLOUD_ENV_ID = ''
```

改成：

```ts
export const CLOUD_ENV_ID = '你的环境 ID'
```

如果由 Codex 继续操作，只需要提供环境 ID 或包含环境 ID 的截图。

## 三、创建数据库集合

1. 在「云开发」面板进入「数据库」。
2. 点击「添加集合」。
3. 集合名称必须填写：`analytics_events`。
4. 权限选择「仅云函数可读写」或控制台中含义相同的最严格选项。

不要选择所有用户可读，也不要开放小程序前端直接写入。

## 四、部署云函数

1. 在微信开发者工具中找到 `cloudfunctions/trackEvent`。
2. 右键 `trackEvent` 文件夹。
3. 选择「上传并部署：云端安装依赖（不上传 node_modules）」。
4. 等待出现上传成功提示。

## 五、验证

1. 重新编译并真机预览。
2. 打开首页、开始一局并完成至少一个选项。
3. 回到云开发控制台，打开 `analytics_events` 集合。
4. 应能看到 `app_open`、`game_start`、`scene_view`、`choice_submit` 等记录。

记录中的 `user_key` 是由微信用户标识转换后的匿名键，前端拿不到原始 OPENID。

## 六、微信自定义分析（可选）

如需同时使用微信公众平台的自定义分析，在平台中创建与代码一致的事件：

- `app_open`
- `game_start`
- `game_resume`
- `intro_complete`
- `scene_view`
- `choice_submit`
- `game_exit`
- `game_restart`
- `game_complete`
- `game_over`

没有配置这些自定义事件时，CloudBase 统计仍可正常工作。
