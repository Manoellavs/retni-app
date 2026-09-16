FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /workspace
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @retni/transactions-remote build

FROM nginx:1.27-alpine
COPY --from=builder /workspace/apps/transactions-remote/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s CMD wget -q -O /dev/null http://localhost/remoteEntry.js || exit 1
