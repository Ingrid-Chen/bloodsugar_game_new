#!/usr/bin/env bash
# 为 healthgame.online 在 Cloudflare 添加 A 记录（@ 和 www → 76.223.126.88，并开启代理）
# 使用前：在 Cloudflare 已添加站点 healthgame.online，并设置环境变量：
#   export CF_API_TOKEN="你的_API_Token"
#   export CF_ZONE_ID="域名的_Zone_ID"

set -e
VERCEL_IP="76.223.126.88"
BASE_URL="https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID:?请设置 CF_ZONE_ID}/dns_records"

if [ -z "${CF_API_TOKEN}" ]; then
  echo "请先设置 CF_API_TOKEN"
  echo "  export CF_API_TOKEN=\"你的_API_Token\""
  exit 1
fi

add_record() {
  local name=$1
  echo "添加 A 记录: $name -> $VERCEL_IP (Proxied)"
  curl -s -X POST "$BASE_URL" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"type\":\"A\",\"name\":\"$name\",\"content\":\"$VERCEL_IP\",\"ttl\":1,\"proxied\":true}" \
    | head -c 500
  echo ""
}

add_record "@"
add_record "www"

echo "完成。请到 Cloudflare DNS 页面确认 @ 和 www 的 A 记录已存在且为 Proxied（小云朵橙色）。"
