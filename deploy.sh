#!/bin/zsh
# 一键部署：给一个本地 html（路径或 file:// 链接），复制到 hub → commit → push，
# 立刻打印可发给别人的公开链接，并在浏览器打开。
# 用法：
#   bash deploy.sh <文件路径或file://链接> [英文slug] [--wait]
#   --wait  等 GitHub Pages 真正生效（返回 200）再打开，最多等 90 秒
set -e
HUB=/Users/mi/Desktop/ai-notes-demo-hub
USER=ylilian777333-rgb
REPO=ai-notes-demo-hub

RAW="$1"
if [ -z "$RAW" ]; then echo "用法: bash deploy.sh <文件路径或file://链接> [slug] [--wait]"; exit 1; fi

WAIT=0; SLUG=""
for a in "$2" "$3"; do
  [ "$a" = "--wait" ] && WAIT=1
  case "$a" in --wait|"") ;; *) [ -z "$SLUG" ] && SLUG="$a" ;; esac
done

# file:// + 中文/URL 编码 → 真实路径
SRC=$(python3 -c "import sys,urllib.parse as u; p=sys.argv[1]; p=p[7:] if p.startswith('file://') else p; print(u.unquote(p))" "$RAW")
if [ ! -f "$SRC" ]; then echo "❌ 找不到文件: $SRC"; exit 1; fi

# slug：优先用户给的；否则文件名 ascii 化；仍为空则时间戳
if [ -z "$SLUG" ]; then
  B=$(basename "$SRC"); B="${B%.html}"
  SLUG=$(printf '%s' "$B" | tr -cd 'A-Za-z0-9._-')
  [ -z "$SLUG" ] && SLUG="demo-$(date +%m%d-%H%M%S)"
fi

cp "$SRC" "$HUB/demos/$SLUG.html"
cd "$HUB"
git add "demos/$SLUG.html" >/dev/null 2>&1 || true
if git diff --cached --quiet; then
  echo "（内容无变化，仍给你现有链接）"
else
  git commit -q -m "deploy: $SLUG"
  git push -q
fi

URL="https://$USER.github.io/$REPO/demos/$SLUG.html"

if [ "$WAIT" = "1" ]; then
  printf "等 Pages 生效"
  for i in $(seq 1 18); do
    code=$(curl -s -o /dev/null -w '%{http_code}' "$URL")
    [ "$code" = "200" ] && break
    printf "."; sleep 5
  done
  echo
fi

echo "$URL"
command -v open >/dev/null && open "$URL"
