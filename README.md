# 记账网页应用

一个简洁实用的个人记账网页应用，支持收支记录、分类管理和数据统计。

## 技术栈

### 前端
- React 18 + TypeScript
- Vite 构建工具
- Ant Design 5.x UI组件库
- Zustand 状态管理
- React Query 数据请求
- ECharts 图表可视化

### 后端
- NestJS 后端框架
- Prisma ORM
- PostgreSQL 数据库
- JWT 认证

### 部署
- Docker + Docker Compose

## 项目结构

```
accounting-app/
├── frontend/          # 前端项目
│   ├── src/
│   │   ├── modules/   # 功能模块
│   │   ├── components/# 公共组件
│   │   ├── services/  # API服务
│   │   ├── types/     # 类型定义
│   │   └── constants/ # 常量定义
│   ├── Dockerfile
│   └── nginx.conf
├── backend/           # 后端项目
│   ├── src/
│   │   ├── modules/   # 功能模块
│   │   ├── prisma/    # Prisma服务
│   │   └── common/    # 公共模块
│   ├── prisma/
│   │   └── schema.prisma # 数据库模型
│   └── Dockerfile
├── docker-compose.yml # Docker编排
└── README.md
```

## 功能模块

- 用户认证（注册、登录、登出）
- 记账管理（添加、编辑、删除、列表）
- 分类管理（预置分类、自定义分类）
- 数据统计（月度概览、分类占比、趋势图）
- 预算管理（设置预算、进度提醒）

## 本地开发

### 前端

```bash
cd frontend
pnpm install
pnpm dev
```

### 后端

```bash
cd backend
pnpm install
# 配置数据库连接
cp .env.example .env
# 初始化数据库
pnpm prisma migrate dev
pnpm dev
```

## Docker部署

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 停止服务
docker-compose down
```

部署完成后访问 http://localhost 即可使用。

## API接口

所有API以 `/api/v1` 为前缀，需要JWT认证。

### 认证模块
- POST `/auth/register` - 注册
- POST `/auth/login` - 登录
- POST `/auth/logout` - 登出
- GET `/auth/profile` - 获取用户信息
- PUT `/auth/profile` - 更新用户信息
- PUT `/auth/password` - 修改密码

### 记账模块
- GET `/records` - 获取记录列表
- POST `/records` - 创建记录
- PUT `/records/:id` - 更新记录
- DELETE `/records/:id` - 删除记录
- GET `/records/statistics` - 获取统计数据
- GET `/records/trend` - 获取趋势数据

### 分类模块
- GET `/categories` - 获取所有分类
- POST `/categories` - 创建分类
- PUT `/categories/:id` - 更新分类
- DELETE `/categories/:id` - 删除分类

### 预算模块
- GET `/budgets` - 获取预算列表
- GET `/budgets/current` - 获取当前预算进度
- POST `/budgets` - 创建/更新预算
- DELETE `/budgets/:id` - 删除预算