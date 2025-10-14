# nginx_lb/Dockerfile

FROM nginx:latest

# Xóa file cấu hình mặc định của Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Sao chép file cấu hình tùy chỉnh của luận văn
COPY nginx.conf /etc/nginx/conf.d/nginx.conf