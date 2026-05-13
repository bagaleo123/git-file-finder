# Build & run on Render with Bun
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile || bun install
COPY . .
RUN bun run build

FROM oven/bun:1
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/render-server.ts ./render-server.ts
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 10000
CMD ["bun", "render-server.ts"]
