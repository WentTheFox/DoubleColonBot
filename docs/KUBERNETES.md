# Running in Kubernetes

- **Image:** `ghcr.io/wentthefox/doublecolonbot:sha-<sha7>` (linux/amd64 + linux/arm64), built by `.github/workflows/images.yml` on every push to `main`. No `latest`, no version tags.
- **Process:** `node ./build/index.js` as the non-root `node` user, logs to stdout/stderr. The image's `HOST` is `0.0.0.0`, `PORT` is `3625`.
- **Health:** `GET /health` returns 200 `{"status":"ok"}` when PostgreSQL (`SELECT 1`) and Redis/Valkey (`PING`) answer, otherwise 503. It is only registered once startup has finished.
- **Exactly one instance:** the bot holds the Twitch chat (IRC) and EventSub websocket connections, so it must never run twice. Use `strategy: Recreate`, `replicas: 1`. SIGTERM/SIGINT make it exit immediately (open connections are closed by its `exit` handlers).
- **Migrations:** run as a separate Job/PreSync hook with the same image and `DATABASE_URL`: `npx node-pg-migrate -f src/node-pg-migrate.config.json up`. Do not use `npm run db up`: its `postdb` step regenerates `src/database/database-schema.ts` and is only for development.
- **Environment variables (all required, names only):** `PORT`, `HOST`, `NODE_ENV`, `PUBLIC_DOMAIN`, `TWITCH_LOGIN`, `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `DATABASE_URL`, `REDIS_URL`, `REDIS_PREFIX`. Secrets: `TWITCH_CLIENT_SECRET`, `DATABASE_URL`, `REDIS_URL`.
- **Volumes:** none.
- **External services:** PostgreSQL database `doublecolonbot`, Redis/Valkey (key prefix from `REDIS_PREFIX`, default `doublecolonbot:`), the Twitch API/IRC/EventSub. No Discord, no mail.
- **Public hosts:** `twitchbot.went.tf` and `twitchbot.djdavid98.art` (`PUBLIC_DOMAIN` is the OAuth redirect host).
- **No `sync-commands`:** this repo has no such script (and no Discord client); the old deploy only ran `npm ci`, `npm run build`, `npm run db up` and a pm2 restart.
