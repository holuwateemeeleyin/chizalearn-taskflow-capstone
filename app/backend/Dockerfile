
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable \
    && corepack prepare pnpm@9.15.9 --activate \
    && pnpm install --prod --frozen-lockfile

COPY dist ./dist

FROM oven/bun:1-alpine

WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist ./dist

ENV NODE_ENV=production

USER app

EXPOSE 3000

CMD ["bun", "dist/index.js"]
