# Multi-Stage Production Dockerfile for Shafsky Frontend Presentation App
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build Vite static assets
RUN pnpm build

# Serve Stage
FROM nginx:1.25-alpine AS runner

# Copy built static assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config with security headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
