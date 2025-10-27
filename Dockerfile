# Sử dụng base image Node.js LTS ổn định
FROM node:20-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép package.json và package-lock.json (nếu có) để tận dụng cache Docker
COPY package*.json ./

# Cài đặt dependencies (Express)
RUN npm install

# Sao chép toàn bộ source code của ứng dụng vào thư mục làm việc
# Bao gồm: index4.html, style.css, chatApp.js, server.js, faqs.json, components, hooks
COPY . .

# Mặc định Express chạy trên cổng 3000
EXPOSE 3000

# Lệnh chạy ứng dụng server.js
CMD [ "npm", "start" ]
