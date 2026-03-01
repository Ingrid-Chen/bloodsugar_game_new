# healthgame.online 迁到 Cloudflare 操作步骤

按顺序完成下面 3 步即可。

---

## 第一步：在 Cloudflare 添加站点

1. 打开 **https://dash.cloudflare.com**，没有账号就先注册（免费）。
2. 点击 **Add a Site**（添加站点）。
3. 输入 **healthgame.online**（不要带 www），点 **Add site**。
4. 选择 **Free** 计划，点 **Continue**。
5. 会看到 **Quick scan** 结果，直接点 **Continue**。
6. 到 **Review your DNS records** 页面：
   - 若有从注册商导入的旧记录，先不用删；
   - 记下下面这一屏会显示的 **Cloudflare 名称服务器（Nameservers）**，例如：
     - `xxx.ns.cloudflare.com`
     - `yyy.ns.cloudflare.com`
   - 点 **Continue** 完成添加。

---

## 第二步：在域名注册商改 NS（名称服务器）

你是在哪里买的 healthgame.online，就去哪里改（阿里云 / 腾讯云 / GoDaddy / Namecheap 等）。

1. 登录**域名注册商**后台，找到 **healthgame.online**。
2. 打开 **DNS 管理** / **修改 DNS 服务器** / **Nameservers**（名称服务器）。
3. 把原来的两条 NS **改成** Cloudflare 给你的两条，例如：
   - 第一条：`xxx.ns.cloudflare.com`（从 Cloudflare 复制）
   - 第二条：`yyy.ns.cloudflare.com`（从 Cloudflare 复制）
4. 保存。生效一般要 **几分钟到 48 小时**，常见是 半小时内。

---

## 第三步：在 Cloudflare 里添加/修改 DNS 记录

等 Cloudflare 左侧站点列表里 **healthgame.online** 状态变成 **Active**（绿勾）后再做。

1. 点击 **healthgame.online** 进入该站点。
2. 左侧点 **DNS** → **Records**。
3. 删除或先不管指向 Vercel 的 CNAME（如 `www` → vercel-dns-xxx.com），我们改用 A 记录。
4. 点击 **Add record**，添加两条 **A 记录**：

   **记录 1（根域名）：**
   - Type: **A**
   - Name: **@**
   - IPv4 address: **76.223.126.88**
   - Proxy status: **Proxied**（小云朵为橙色）
   - 点 **Save**

   **记录 2（www）：**
   - Type: **A**
   - Name: **www**
   - IPv4 address: **76.223.126.88**
   - Proxy status: **Proxied**（小云朵为橙色）
   - 点 **Save**

5. 再检查 **SSL/TLS**：
   - 左侧 **SSL/TLS** → 右侧 **Overview** 里加密模式选 **Full (strict)**。

6. **Vercel 不用改**：在 Vercel 的 Domains 里保持 **www.healthgame.online** 和 **healthgame.online** 即可。

完成后用手机 4G 或换网络访问 https://www.healthgame.online 试一下。

---

## 可选：用脚本自动添加这两条 A 记录

若你已有 Cloudflare **API Token** 和该域名的 **Zone ID**，可在项目根目录执行：

```bash
# 在项目根目录
export CF_API_TOKEN="你的_API_Token"
export CF_ZONE_ID="healthgame.online的Zone_ID"
./scripts/setup-cloudflare-dns.sh
```

- API Token：Cloudflare 右上角头像 → My Profile → API Tokens → Create Token，选 “Edit zone DNS” 模板，权限包含 Zone.DNS Edit，Zone 选 healthgame.online。
- Zone ID：在 Cloudflare 里点 healthgame.online → 右侧 Overview 里 “Zone ID” 那一行。

脚本会为 **@** 和 **www** 创建 A 记录 76.223.126.88 并开启代理。
