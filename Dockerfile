# ==========================================
# STAGE 1: MÔI TRƯỜNG BUILD (Node.js)
# ==========================================
# Sử dụng Node.js bản alpine siêu nhẹ
FROM node:18-alpine AS builder

# Thiết lập thư mục làm việc
WORKDIR /app

# Chỉ copy package.json vào trước để tận dụng cache của Docker
COPY package*.json ./

# Cài đặt toàn bộ thư viện (node_modules)
RUN npm install

# Copy toàn bộ source code vào
COPY . .

# Chạy lệnh build ra file tĩnh (HTML, CSS, JS) vào thư mục /app/build
RUN npm run build

# ==========================================
# STAGE 2: MÔI TRƯỜNG CHẠY THỰC TẾ (Nginx)
# ==========================================
FROM nginx:alpine

# Copy toàn bộ file đã build từ STAGE 1 (builder) sang thư mục host của Nginx
# Hành động này giúp vứt bỏ hoàn toàn thư mục node_modules nặng nề ở lại STAGE 1
COPY --from=builder /app/build /usr/share/nginx/html

# CẤU HÌNH QUAN TRỌNG CHO REACT ROUTER
# Fix lỗi 404 Not Found khi người dùng ấn F5 (Refresh) trang web hoặc truy cập link trực tiếp
RUN sed -i 's/index  index.html index.htm;/index  index.html index.htm;\n        try_files $uri $uri\/ \/index.html;/' /etc/nginx/conf.d/default.conf

# Mở cổng 80 cho Nginx
EXPOSE 80

# Khởi chạy Nginx
CMD ["nginx", "-g", "daemon off;"]