FROM node:18-alpine AS builder

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制package.json
COPY package.json pnpm-lock.yaml* ./

# 安装依赖
RUN pnpm install

# 复制prisma和源代码
COPY prisma ./prisma/
COPY . .

# 生成Prisma Client
RUN pnpm prisma generate

# 构建
RUN pnpm run build

# 生产阶段
FROM node:18-alpine

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制构建产物和必要文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma/

# 安装生产依赖
RUN pnpm install --prod

# 生成Prisma Client
RUN pnpm prisma generate

# 创建.env文件（生产环境应该使用环境变量）
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main.js"]