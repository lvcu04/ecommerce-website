# Giai đoạn 1: Cài đặt Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Sao chép package.json và cài đặt dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Giai đoạn 2: Build ứng dụng
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Tắt Next.js telemetry để không gửi dữ liệu ẩn danh
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Giai đoạn 3: Chạy Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Tạo group và user riêng để chạy ứng dụng với quyền hạn thấp hơn (an toàn hơn)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Sao chép các file cần thiết từ giai đoạn build
COPY --from=builder /app/public ./public

# Sao chép output của standalone build
# Dockerfile này sẽ tự động sao chép các file cần thiết vào đúng vị trí
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Chuyển sang user vừa tạo
USER nextjs

EXPOSE 3000
ENV PORT 3000

# Lệnh khởi động server của chế độ standalone
CMD ["node", "server.js"]