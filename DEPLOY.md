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
cd 你的项目目录
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
cd 你的项目目录
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

## 中国大陆访问方案（Vercel 在国内被墙时）

`vercel.app` 域名在国内存在 DNS 污染/访问不稳定，国内用户可能打不开。可用下面任一方式解决。

### 方案 A：Cloudflare + 自有域名（零备案、推荐先试）

用 **自己的域名** 走 Cloudflare 再指向 Vercel，国内访问有时会改善（不保证 100% 稳定）。

1. **准备**
   - 注册 [Cloudflare](https://www.cloudflare.com)
   - 一个国内能解析的域名（如阿里云 1 元 xyz/top 等）

2. **在 Cloudflare 添加站点**
   - 登录 Cloudflare → **Add a Site** → 输入你的域名 → 选 **Free** 计划
   - 按提示把该域名的 **NS（名称服务器）** 改成 Cloudflare 提供的两条（去域名注册商如阿里云里改「DNS 服务器」）

3. **添加 DNS 记录**
   - 在 Cloudflare 该域名的 **DNS → Records** 里新增：
     - **Type**：`A`
     - **Name**：`@`（根域名）或 `www`（子域名）
     - **IPv4 address**：`76.223.126.88`（Vercel 提供的可用 IP，用于国内解析）
     - **Proxy status**：打开小云朵（Proxied），走 Cloudflare 节点

4. **SSL**
   - **SSL/TLS** → 选 **Full (strict)**，避免重定向过多打不开

5. **在 Vercel 绑定域名**
   - Vercel 项目 → **Settings → Domains** → 添加你的域名（如 `www.你的域名.com`）
   - 按 Vercel 提示在 Cloudflare 里补全 CNAME（若用子域名）或保持 A 记录即可

完成后用 **你的域名** 访问，不要再用 `xxx.vercel.app` 发给国内朋友。

### 方案 B：国内平台做「镜像」部署（最稳定）

把同一套前端再部署到国内可访问的平台，国内用户访问国内地址。

| 平台 | 说明 | 备注 |
|------|------|------|
| **腾讯云静态网站托管** | 云开发 → 静态网站，关联 GitHub 可自动部署 | 需腾讯云账号，按量免费额度 |
| **阿里云 OSS + 静态页面** | 把构建产物上传到 OSS，开启静态站 | 需阿里云，可配合 CDN |
| **Gitee Pages** | 代码放 Gitee，开启 Pages | 免费，国内访问快 |
| **Coding.net（腾讯云 DevOps）** | 类似 GitHub Pages | 有免费额度 |

做法：本地 `npm run build` 后，把 `.next` 或导出后的静态文件上传/同步到上述平台；或把仓库推到 Gitee/Coding 后在其 Pages 里选 Node 构建。这样 **Vercel 继续当主站（海外）**，国内发 **国内镜像链接**。

### 方案 C：自建 VPS 反代或自建 PaaS

- 买一台 **国内或香港** VPS，用 Nginx 反代你的 Vercel 地址（或同一项目再 build 一份在 VPS 上跑）。
- 或用 [Dokploy](https://dokploy.com) 等自建 PaaS，把项目部署在自己的 VPS 上，国内访问走你自己的服务器。

---

## 其他平台（备选）

- **Netlify**：流程类似，在 netlify.com 选 “Import from Git” 或拖拽构建产物。
- **Cloudflare Pages**：需配置 Next.js 适配器，步骤稍多。

建议优先用 **方式一（Vercel CLI）**，最快能拿到可分享的链接。
