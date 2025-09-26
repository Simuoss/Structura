# Dockerfile

# --- Stage 1: 使用一个轻量级的 Nginx 镜像作为基础 ---
# Nginx 是一个非常高效的 Web 服务器，非常适合托管静态文件。
# 'alpine' 版本非常小，可以大大减小我们最终镜像的体积。
FROM nginx:alpine

# --- Stage 2: 复制你的网站文件到 Nginx 的默认托管目录 ---
# 将你当前目录下的所有文件 (HTML, CSS, JS) 复制到镜像里的 /usr/share/nginx/html 目录下。
COPY . /usr/share/nginx/html

# --- Stage 3: (可选) 暴露端口 ---
# 告诉 Docker 这个容器将会监听 80 端口。
EXPOSE 80