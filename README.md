# Tarot Stars

Telegram 塔罗牌 Bot 与 Telegram Mini App 的单体仓库。

- 后端：Node.js + TypeScript + grammY + Express + MongoDB
- 前端：React + TypeScript + Redux Toolkit，作为 Telegram Mini App
- 当前推荐部署方式：**仅 Bot 模式**，不需要域名和 HTTPS

## 目录结构

```text
tarot-stars/
├── apps/
│   ├── tarot-stars-server/
│   │   ├── Dockerfile
│   │   └── src/scripts/
│   └── tarot-stars-app/
│       ├── Dockerfile
│       └── nginx.conf
├── .env.example
├── docker-compose.yml
└── README.md
```

后端保留的脚本：

- `import-tarot-cards.ts`：从 `tarot_78_full_zh.json` 导入 78 张牌、分类、花色和牌组
- `migrate-rider-waite.ts`：从公开数据源迁移 Rider-Waite 牌组

## 1. 首次部署：仅 Bot 模式

Bot 使用 long polling，不需要域名、HTTPS 或 webhook。

### 1.1 准备代码与环境变量

```bash
git clone git@github.com:AzureWynn/TarotStars.git
cd TarotStars
cp .env.example .env
nano .env
```

最小可用配置：

```text
BOT_TOKEN=<BotFather 提供的 token>
TELEGRAM_BOT_SECRET_TOKEN=<随机值，Bot 模式实际不使用>
MONGODB_URI=mongodb://mongo:27017/tarot-stars
MONGODB_DB_NAME=tarot-stars
PORT=3001
NODE_ENV=production
SKIP_TELEGRAM_AUTH=true
MINI_APP_URL=https://127.0.0.1:3000
JWT_SECRET=<openssl rand -hex 32 的结果>
API_SECRET=<openssl rand -hex 32 的结果>
# SOCKS_PROXY 保持注释
```

生成随机值：

```bash
openssl rand -hex 32
```

### 1.2 启动并导入牌库

```bash
git pull
docker compose up -d --build mongo server
docker compose run --rm server node dist/scripts/import-tarot-cards.js
docker compose logs -f server
```

说明：

- 导入脚本会清空并重建牌库集合，**只在首次部署或需要重置牌库时执行**。
- `web` 服务不需要启动。
- `docker compose logs -f server` 只是查看日志，按 `Ctrl+C` 退出不会影响服务。
- 看到 `✅ Successfully imported 78 cards` 表示导入成功。

### 1.3 验证

在 Telegram 里给 Bot 发送：

```text
/start
/daily
/history
```

也可以在服务器上确认牌库数量：

```bash
docker compose exec mongo mongosh --quiet --eval \
  'db.getSiblingDB("tarot-stars").tarot_cards_multilingual.countDocuments({})'
```

返回 `78` 表示数据正常。

## 2. 日常运维

### 启动服务

```bash
cd TarotStars
docker compose up -d mongo server
```

### 代码更新后重新构建

```bash
git pull
docker compose up -d --build mongo server
```

### 重启后端

```bash
docker compose restart server
```

### 停止服务（保留数据）

```bash
docker compose stop mongo server
```

或：

```bash
docker compose down
```

### 查看状态与日志

```bash
docker compose ps
docker compose logs -f server
```

⚠️ **不要使用 `docker compose down -v`。** `-v` 会删除 MongoDB 数据卷，牌库和用户数据都会丢失。

## 3. 数据与备份

MongoDB 数据保存在 `mongo-data` 卷中。容器停止、重启、重建都不会丢数据，除非删除该卷。

备份：

```bash
docker compose exec mongo mongodump --archive --db tarot-stars > backup.archive
```

恢复：

```bash
docker compose exec -T mongo mongorestore --archive --db tarot-stars < backup.archive
```

只有以下情况需要重新导入牌库：

- 首次部署
- 执行过 `docker compose down -v`
- 修改了 `tarot_78_full_zh.json`，想重置牌库

## 4. 可选：完整部署 Mini App

Mini App 需要 Telegram 可访问的 HTTPS 域名和可信证书，裸公网 IP 与自签证书不可用。

需要设置：

```text
MINI_APP_URL=https://你的域名
REACT_APP_API_BASE_URL=https://你的域名/api/v2/tarot
```

`REACT_APP_API_BASE_URL` 会在构建前端镜像时写入产物，修改后必须重新构建：

```bash
docker compose up -d --build web
```

用 Nginx 或 Caddy 在 443 端口终止 TLS：

- `https://你的域名/` → `127.0.0.1:3000`
- `https://你的域名/api/` → `127.0.0.1:3001`

然后在 BotFather 中用 `/setmenubutton` 把 Mini App URL 设为 `https://你的域名`。

Bot 的 long polling 不需要 webhook 回调地址。

## 5. 本地开发

需要 Node.js 20+ 和本机 MongoDB 27017。

```bash
cp .env.example apps/tarot-stars-server/.env
# 修改 apps/tarot-stars-server/.env：
#   MONGODB_URI=mongodb://localhost:27017/tarot-stars
#   NODE_ENV=development
#   SKIP_TELEGRAM_AUTH=true
#   MINI_APP_URL=https://127.0.0.1:3000

cd apps/tarot-stars-server
npm install
npm run import:tarot-cards
npm run dev
```

另一个终端启动前端：

```bash
cd apps/tarot-stars-app
npm install
npm start
```

前端访问 `https://127.0.0.1:3000`，后端 API 在 `https://127.0.0.1:3001`。

前端本地 HTTPS 证书不入库，需要自行准备并放到 `apps/tarot-stars-app/certificates/`。

## 6. 安全说明

- 仓库中不包含任何 `.env` 文件，`.env.example` 只有占位符。
- 部署前请到 BotFather 获取新的 Bot token。
- `JWT_SECRET`、`API_SECRET` 请使用随机值，不要使用示例值。
- 前端本地 HTTPS 证书不入库。
- 如果服务器在国内导致 Bot 连不上 Telegram，需要额外配置代理；当前生产模式下 `SOCKS_PROXY` 不会自动生效。

## 7. 常用命令

后端：

```bash
cd apps/tarot-stars-server
npm run build
npm start
npm run import:tarot-cards
npm run migrate:rider-waite
```

前端：

```bash
cd apps/tarot-stars-app
npm run build
```
