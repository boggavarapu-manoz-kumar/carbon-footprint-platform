# Multi-Stage Production Dockerfile for Admin Frontend (React / Vite)

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arguments for environment injection
ARG VITE_API_URL
ARG VITE_USER_APP_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_USER_APP_URL=$VITE_USER_APP_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
