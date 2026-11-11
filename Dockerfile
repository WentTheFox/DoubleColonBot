# syntax=docker/dockerfile:1
# DoubleColonBot: one image for the bot (default CMD) and the migration Job (see docs/KUBERNETES.md).
# node-pg-migrate runs the TypeScript migrations through ts-node, so dev dependencies stay in the image.
FROM node:24-bookworm-slim

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3625
WORKDIR /app

COPY package.json package-lock.json ./
# `prepare` runs ts-patch (needed by typia at build time)
RUN npm ci --include=dev

COPY tsconfig.json tsconfig.migrations.json ./
COPY src ./src
COPY migrations ./migrations
RUN npm run build && chown -R node:node /app

USER node
EXPOSE 3625
# Node as PID 1 receives SIGTERM directly (no npm/pm2 wrapper); logs go to stdout/stderr
CMD ["node", "./build/index.js"]
