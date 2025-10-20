FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

# --- THÊM CÁC DÒNG SAU VÀO ĐÂY ---
# Sao chép schema của Prisma vào
COPY prisma ./prisma/
# Chạy Prisma Generate để tạo client
RUN npx prisma generate
# --------------------------------

# Copy toàn bộ mã nguồn backend còn lại
COPY . .

EXPOSE 3001

# Lệnh CMD này giữ nguyên, vì migrate và seed đã có trong docker-compose.yml
CMD ["npm", "run", "start:dev"]