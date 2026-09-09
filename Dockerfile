# Multi-Stage Production Dockerfile for Shafsky Frontend (TanStack Start SSR)
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build with Nitro node-server preset for production container
ENV NITRO_PRESET=node-server
ENV NODE_ENV=production
RUN pnpm build

# Serve Stage (Node.js SSR Server)
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy built server and public client assets
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

