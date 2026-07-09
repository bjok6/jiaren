# 使用官方轻量级的 Node.js 20 镜像作为基础
FROM node:20-alpine

# 在容器内设置工作目录
WORKDIR /usr/src/app

# 优先复制依赖清单，利用 Docker 缓存加速构建
COPY package*.json ./

RUN apk add --no-cache git
# 安装生产环境依赖包
RUN npm install --production

# 将当前目录下的所有文件
COPY . .

EXPOSE 3000

# 启动容器时执行的命令
CMD ["node", "index.js"]
