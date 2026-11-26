# Tarot Stars

Telegram 塔罗牌 Bot + Mini App 的单体仓库。后端提供 Telegram Bot、REST API 与 MongoDB 持久化；前端是 Telegram Mini App，通过 API 与后端通信。

## 目录结构

```text
tarot-stars/
├── apps/
│   ├── tarot-stars-server/   # Node.js + TypeScript + grammY + Express + MongoDB
│   │   ├── Dockerfile
│   │   └── src/scripts/      # 仅保留导入/迁移/验证所需脚本
│   └── tarot-stars-app/      # React + TypeScript + Redux Toolkit
│       ├── Dockerfile
│       └── nginx.conf
├── .env.example
├── docker-compose.yml
└── README.md
```

保留的脚本：

- `import-tarot-cards.ts`：从 `tarot_78_full_zh.json` 导入 78 张牌、分类、花色和牌组
- `migrate-rider-waite.ts` / `verify-rider-waite.ts`
- `migrate-new-tarot-schema.ts` / `verify-new-tarot-schema.ts`
- `full-migration-and-verification.ts`

其他一次性维护脚本已移出仓库，仍保留在原来的 `old/` 目录中。

## 安全说明

- 仓库中不包含任何 `.env` 文件，`.env.example` 只有占位符。
- 旧项目中出现过的 Bot token 及密钥已在本机另行备份到仓库外的 `LOCAL_SECRETS_BACKUP.env`。
- 由于旧 `.env.example` 曾包含真实 token，建议到 BotFather 轮换 token，并把 `TELEGRAM_BOT_SECRET_TOKEN`、`JWT_SECRET`、`API_SECRET` 一并换成新随机值。
- 前端启动时使用的本地 HTTPS 证书不入库。本地开发请从 `old/tarot-stars-app/certificates/` 复制证书到 `apps/tarot-stars-app/certificates/`。

## 本地开发

需要本机已安装 Node.js 20+、MongoDB 27017。

```bash
# 1. 准备后端环境变量
cp .env.example apps/tarot-stars-server/.env
# 修改 apps/tarot-stars-server/.env：
#   MONGODB_URI=mongodb://localhost:27017/tarot-stars
#   NODE_ENV=development
#   SKIP_TELEGRAM_AUTH=true
#   MINI_APP_URL=https://127.0.0.1:3000

# 2. 安装依赖并导入牌库数据
cd apps/tarot-stars-server
npm install
npm run import:tarot-cards
npm run dev

# 3. 另开终端启动前端
cd apps/tarot-stars-app
npm install
npm start
```

前端访问 `https://127.0.0.1:3000`，后端 API 在 `https://127.0.0.1:3001`。

## Docker 部署

一份 compose 会同时构建后端和前端镜像，并启动 MongoDB：

```bash
cp .env.example .env
# 编辑 .env，填入真实 token、域名和密钥
docker compose up -d --build
```

服务说明：

- `mongo`：MongoDB 7，数据卷 `mongo-data`
- `server`：Node 服务，宿主机端口 `3001`
- `web`：静态前端，宿主机端口 `3000`

部署前必须确认：

1. `MINI_APP_URL` 是 Telegram 可访问的公网 HTTPS 地址。
2. `REACT_APP_API_BASE_URL` 是公网 HTTPS API 地址，例如 `https://api.example.com/api/v2/tarot`。它在**构建时**被写入前端产物，修改后必须重新构建 `web` 镜像。
3. 用 Nginx / Caddy / 云负载均衡在 443 端口终止 TLS，再反代到容器的 `3000` 和 `3001`。容器内的 Node 服务只监听 HTTP。
4. Bot 使用 long polling，不需要配置 webhook 回调地址。

## 常用命令

```bash
# 后端
cd apps/tarot-stars-server
npm run build
npm start
npm run import:tarot-cards
npm run migrate:full

# 前端
cd apps/tarot-stars-app
npm run build
```
