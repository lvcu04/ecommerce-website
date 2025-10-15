# frontend_app/Dockerfile

# --- GIAI ĐOẠN 1: BUILD ---
FROM node:20 AS builder

WORKDIR /app

# Copy các file cấu hình quan trọng 
COPY package.json package-lock.json tsconfig.json next.config.ts ./ 

# Cài đặt dependencies 
RUN npm ci

# Copy toàn bộ mã nguồn Frontend
COPY . .

# Chạy lệnh build Next.js 
RUN npm run build

# --- GIAI ĐOẠN 2: PRODUCTION RUNTIME ---
FROM node:20-slim AS runner

WORKDIR /app
ENV NODE_ENV production
ENV PORT 3000

# KHẮC PHỤC LỖI ENOENT: CẦN COPY package.json (ĐIỂM THIẾU CỦA CÁC LẦN TRƯỚC)
# 1. Copy package.json để lệnh "npm start" hoạt động
COPY --from=builder /app/package.json ./package.json

# 2. Copy các thư mục cần thiết
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

# Lệnh khởi động Next.js Production Server
CMD ["npm", "run" , "dev"]