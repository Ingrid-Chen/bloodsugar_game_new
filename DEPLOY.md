# 控糖生存指南 - 部署说明

把项目部署到公网后，朋友通过一个链接即可在浏览器里玩（手机/电脑都行）。

---

## 方式一：用 Vercel 部署（推荐）

Vercel 是 Next.js 官方推荐平台，免费且对 Next.js 零配置。

### 1. 安装 Vercel CLI（本机只需做一次）

```bash
npm i -g vercel
```

### 2. 在项目目录里登录并部署

```bash
cd /Users/yyz/Documents/vibecoding/bloodsugar/bloodsugar-v0
vercel login    # 按提示用邮箱或 GitHub 登录
vercel          # 首次会问项目名、是否 link 等，一路回车即可
```

### 3. 获得链接

- 部署完成后终端会给出一个地址，例如：`https://bloodsugar-xxx.vercel.app`
- 把这个链接发给朋友即可，无需安装任何东西，打开就能玩。

### 4. 之后更新游戏

改完代码后，在项目目录再执行一次：

```bash
vercel --prod
```

就会更新线上版本，链接不变。

---

## 方式二：用 GitHub + Vercel 网页部署

适合想用 Git 管理、并自动部署的场景。

### 1. 把代码推到 GitHub

- 在 GitHub 新建一个仓库（如 `bloodsugar-game`）
- 在本机项目目录执行：

```bash
cd /Users/yyz/Documents/vibecoding/bloodsugar/bloodsugar-v0
git init
git add .
git commit -m "Initial: 控糖生存指南"
git branch -M main
git remote add origin https://github.com/你的用户名/bloodsugar-game.git
git push -u origin main
```

### 2. 在 Vercel 里导入项目

- 打开 [vercel.com](https://vercel.com) 并登录（可用 GitHub 登录）
- 点击 **Add New → Project**
- 选择刚推送的 **bloodsugar-game** 仓库
- 保持默认设置，直接点 **Deploy**
- 等一两分钟，会得到一个 `xxx.vercel.app` 的链接

### 3. 之后更新

以后每次执行 `git push` 到该仓库，Vercel 会自动重新部署，链接不变。

---

## 可选：自定义域名

在 Vercel 项目里进入 **Settings → Domains**，可绑定自己的域名（如 `sugar.你的域名.com`），朋友用这个域名访问即可。

---

## 其他平台（备选）

- **Netlify**：流程类似，在 netlify.com 选 “Import from Git” 或拖拽构建产物。
- **Cloudflare Pages**：需配置 Next.js 适配器，步骤稍多。

建议优先用 **方式一（Vercel CLI）**，最快能拿到可分享的链接。
