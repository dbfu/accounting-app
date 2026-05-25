# 记账网页应用 - 技术架构文档

## 一、技术选型

### 1.1 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | 前端框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 5.x | 构建工具 |
| Ant Design | 5.x | UI组件库 |
| Tailwind CSS | 3.x | 原子化CSS |
| Zustand | 4.x | 全局状态管理 |
| React Query | 5.x | 服务端状态管理 |
| ECharts | 5.x | 图表可视化 |
| React Router | 6.x | 路由管理 |
| Axios | 1.x | HTTP客户端 |
| Day.js | 1.x | 日期处理 |

### 1.2 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| NestJS | 10.x | 后端框架 |
| TypeScript | 5.x | 类型安全 |
| Prisma | 5.x | ORM框架 |
| PostgreSQL | 16.x | 主数据库 |
| Passport | 0.7.x | 认证中间件 |
| JWT | 9.x | Token认证 |
| class-validator | 0.14.x | 参数校验 |
| bcrypt | 5.x | 密码加密 |

### 1.3 开发工具

| 工具 | 用途 |
|------|------|
| Docker | 容器化部署 |
| Docker Compose | 多容器编排 |
| pnpm | 包管理器 |

---

## 二、系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                          用户浏览器                              │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Nginx (反向代理)                             │
│                    端口: 80/443                                  │
│         ┌──────────────────────────────────────┐                │
│         │  静态资源: / -> Frontend Build        │                │
│         │  API代理: /api/* -> Backend:3000      │                │
│         └──────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
                    │                           │
                    ▼                           ▼
┌─────────────────────────┐     ┌─────────────────────────────────┐
│    Frontend (React)      │     │      Backend (NestJS)           │
│    静态文件托管           │     │        端口: 3000               │
└─────────────────────────┘     └─────────────────────────────────┘
                                               │
                                               ▼
                               ┌─────────────────────────────────┐
                               │      PostgreSQL Database        │
                               │          端口: 5432             │
                               └─────────────────────────────────┘
```

### 2.2 模块划分

#### 前端模块

```
frontend/
├── src/
│   ├── modules/           # 功能模块
│   │   ├── auth/          # 认证模块
│   │   │   ├── pages/     # 登录/注册页面
│   │   │   ├── hooks/     # 认证相关hooks
│   │   │   └── store/     # 认证状态
│   │   ├── dashboard/     # 首页/概览
│   │   │   └── pages/
│   │   ├── records/       # 记账模块
│   │   │   ├── pages/     # 记账页面
│   │   │   ├── components/# 记账组件
│   │   │   └── store/     # 记账状态
│   │   ├── categories/    # 分类管理
│   │   │   ├── pages/
│   │   │   └── components/
│   │   ├── bills/         # 账单管理
│   │   │   ├── pages/
│   │   │   └── components/
│   │   ├── statistics/    # 数据统计
│   │   │   ├── pages/
│   │   │   └── components/
│   │   └── budget/        # 预算管理
│   │       ├── pages/
│   │       └── components/
│   ├── components/        # 公共组件
│   │   ├── Layout/        # 布局组件
│   │   ├── Header/        # 头部组件
│   │   └── common/        # 通用组件
│   ├── services/          # API服务
│   ├── hooks/             # 公共hooks
│   ├── utils/             # 工具函数
│   ├── types/             # 类型定义
│   └── constants/         # 常量定义
```

#### 后端模块

```
backend/
├── src/
│   ├── modules/           # 功能模块
│   │   ├── auth/          # 认证模块
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── strategies/ # JWT策略
│   │   │   └── dto/       # 数据传输对象
│   │   ├── users/         # 用户模块
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.module.ts
│   │   │   └── entities/
│   │   ├── records/       # 记账记录模块
│   │   │   ├── records.controller.ts
│   │   │   ├── records.service.ts
│   │   │   ├── records.module.ts
│   │   │   └── dto/
│   │   ├── categories/    # 分类模块
│   │   │   ├── categories.controller.ts
│   │   │   ├── categories.service.ts
│   │   │   ├── categories.module.ts
│   │   │   └── dto/
│   │   └── budget/        # 预算模块
│   │       ├── budget.controller.ts
│   │       ├── budget.service.ts
│   │       ├── budget.module.ts
│   │       └── dto/
│   ├── common/            # 公共模块
│   │   ├── decorators/    # 自定义装饰器
│   │   ├── filters/       # 异常过滤器
│   │   ├── guards/        # 守卫
│   │   ├── interceptors/  # 拦截器
│   │   └── pipes/         # 管道
│   ├── config/            # 配置模块
│   └── prisma/            # Prisma服务
└── prisma/
    └── schema.prisma      # 数据库模型
```

---

## 三、数据库设计

### 3.1 ER图

```
┌──────────────────┐       ┌──────────────────┐
│      users       │       │    categories    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │───┐   │ id (PK)          │
│ username         │   │   │ name             │
│ email            │   │   │ type             │
│ password         │   │   │ icon             │
│ avatar          │   │   │ color            │
│ created_at       │   │   │ sort_order       │
│ updated_at       │   │   │ user_id (FK)─────│───┘
└──────────────────┘   │   │ created_at       │
        │              │   │ updated_at       │
        │              │   └──────────────────┘
        │              │           │
        │              │           │
        │              │   ┌───────┘
        │              │   │
        ▼              │   ▼
┌──────────────────┐   │   ┌──────────────────┐
│     records      │   │   │     budgets      │
├──────────────────┤   │   ├──────────────────┤
│ id (PK)          │   │   │ id (PK)          │
│ type             │   │   │ amount           │
│ amount           │   │   │ month             │
│ description      │   │   │ user_id (FK)─────│───┐
│ record_date      │   │   │ created_at       │   │
│ user_id (FK)─────│───┘   │ updated_at       │   │
│ category_id (FK)─│───────└──────────────────┘   │
│ created_at       │                             │
│ updated_at       │─────────────────────────────┘
└──────────────────┘
```

### 3.2 数据表详细设计

#### users 用户表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 用户唯一标识 |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| email | VARCHAR(100) | UNIQUE, NOT NULL | 邮箱 |
| password | VARCHAR(255) | NOT NULL | 加密密码 |
| avatar | VARCHAR(255) | NULL | 头像URL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新时间 |

#### categories 分类表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 分类唯一标识 |
| name | VARCHAR(50) | NOT NULL | 分类名称 |
| type | ENUM('income', 'expense') | NOT NULL | 分类类型 |
| icon | VARCHAR(50) | NULL | 图标名称 |
| color | VARCHAR(20) | NULL | 颜色标识 |
| sort_order | INTEGER | DEFAULT 0 | 排序顺序 |
| user_id | UUID | FK, NULL | 所属用户(NULL为系统默认) |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

#### records 记账记录表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 记录唯一标识 |
| type | ENUM('income', 'expense') | NOT NULL | 类型(收入/支出) |
| amount | DECIMAL(12,2) | NOT NULL | 金额 |
| description | VARCHAR(255) | NULL | 备注/描述 |
| record_date | DATE | NOT NULL | 记账日期 |
| user_id | UUID | FK, NOT NULL | 所属用户 |
| category_id | UUID | FK, NOT NULL | 所属分类 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

#### budgets 预算表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 预算唯一标识 |
| amount | DECIMAL(12,2) | NOT NULL | 预算金额 |
| month | VARCHAR(7) | NOT NULL | 预算月份(YYYY-MM) |
| user_id | UUID | FK, NOT NULL | 所属用户 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

#### 索引设计

```sql
-- users表索引
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- categories表索引
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);

-- records表索引
CREATE INDEX idx_records_user_id ON records(user_id);
CREATE INDEX idx_records_category_id ON records(category_id);
CREATE INDEX idx_records_record_date ON records(record_date);
CREATE INDEX idx_records_user_date ON records(user_id, record_date);

-- budgets表索引
CREATE UNIQUE INDEX idx_budgets_user_month ON budgets(user_id, month);
```

---

## 四、API设计

### 4.1 API规范

- 基础路径: `/api/v1`
- 认证方式: JWT Bearer Token
- 响应格式: JSON

#### 统一响应格式

**成功响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

**分页响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

**错误响应**
```json
{
  "code": 10001,
  "message": "用户名已存在",
  "data": null
}
```

### 4.2 接口清单

#### 认证模块 `/api/v1/auth`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /register | 用户注册 | 否 |
| POST | /login | 用户登录 | 否 |
| POST | /logout | 用户登出 | 是 |
| GET | /profile | 获取当前用户信息 | 是 |
| PUT | /profile | 更新用户信息 | 是 |
| PUT | /password | 修改密码 | 是 |

#### 记账记录模块 `/api/v1/records`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | / | 获取记账记录列表(分页) | 是 |
| GET | /:id | 获取单条记录详情 | 是 |
| POST | / | 创建记账记录 | 是 |
| PUT | /:id | 更新记账记录 | 是 |
| DELETE | /:id | 删除记账记录 | 是 |
| GET | /statistics | 获取统计数据 | 是 |
| GET | /trend | 获取趋势数据 | 是 |

#### 分类模块 `/api/v1/categories`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | / | 获取所有分类 | 是 |
| GET | /:id | 获取分类详情 | 是 |
| POST | / | 创建分类 | 是 |
| PUT | /:id | 更新分类 | 是 |
| DELETE | /:id | 删除分类 | 是 |

#### 预算模块 `/api/v1/budgets`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | / | 获取预算列表 | 是 |
| GET | /current | 获取当前月预算 | 是 |
| POST | / | 创建/更新预算 | 是 |
| DELETE | /:id | 删除预算 | 是 |

### 4.3 核心接口详细设计

#### 用户注册

**请求**
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Password123!"
}
```

**响应**
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "id": "uuid",
    "username": "testuser",
    "email": "test@example.com",
    "createdAt": "2026-05-25T10:00:00Z"
  }
}
```

#### 用户登录

**请求**
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "Password123!"
}
```

**响应**
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "username": "testuser",
      "email": "test@example.com",
      "avatar": null
    }
  }
}
```

#### 创建记账记录

**请求**
```
POST /api/v1/records
Content-Type: application/json
Authorization: Bearer {token}

{
  "type": "expense",
  "amount": 35.50,
  "description": "午餐",
  "recordDate": "2026-05-25",
  "categoryId": "uuid"
}
```

**响应**
```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": "uuid",
    "type": "expense",
    "amount": 35.50,
    "description": "午餐",
    "recordDate": "2026-05-25",
    "categoryId": "uuid",
    "category": {
      "id": "uuid",
      "name": "餐饮",
      "icon": "food",
      "color": "#FF6B6B"
    },
    "createdAt": "2026-05-25T10:00:00Z"
  }
}
```

#### 获取记账记录列表

**请求**
```
GET /api/v1/records?page=1&pageSize=20&month=2026-05&type=expense&categoryId=uuid
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "uuid",
        "type": "expense",
        "amount": 35.50,
        "description": "午餐",
        "recordDate": "2026-05-25",
        "category": {
          "id": "uuid",
          "name": "餐饮",
          "icon": "food",
          "color": "#FF6B6B"
        },
        "createdAt": "2026-05-25T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20,
    "summary": {
      "totalIncome": 10000.00,
      "totalExpense": 3500.00,
      "balance": 6500.00
    }
  }
}
```

#### 获取统计数据

**请求**
```
GET /api/v1/records/statistics?month=2026-05
Authorization: Bearer {token}
```

**响应**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "month": "2026-05",
    "totalIncome": 10000.00,
    "totalExpense": 3500.00,
    "balance": 6500.00,
    "categoryBreakdown": [
      {
        "categoryId": "uuid",
        "categoryName": "餐饮",
        "amount": 1200.00,
        "percentage": 34.29,
        "color": "#FF6B6B"
      },
      {
        "categoryId": "uuid",
        "categoryName": "交通",
        "amount": 500.00,
        "percentage": 14.29,
        "color": "#4ECDC4"
      }
    ]
  }
}
```

---

## 五、安全设计

### 5.1 认证与授权

- JWT Token认证
- Token过期时间: 7天
- 密码加密: bcrypt (salt rounds: 10)
- 敏感接口需验证Token

### 5.2 接口安全

- 所有接口强制HTTPS
- CORS配置白名单
- 请求频率限制 (Rate Limiting)
- SQL注入防护 (Prisma参数化查询)
- XSS防护 (输入过滤)

### 5.3 数据安全

- 密码不明文存储
- 敏感数据传输加密
- 数据库定期备份

---

## 六、部署架构

### 6.1 Docker容器架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     Docker Compose                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│   │   nginx     │    │   backend   │    │  postgres   │         │
│   │   端口:80   │───▶│   端口:3000  │───▶│   端口:5432  │         │
│   │             │    │             │    │             │         │
│   │  前端静态文件 │    │  NestJS API  │    │  PostgreSQL  │         │
│   └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 目录结构

```
accounting-app/
├── frontend/                # 前端项目
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                 # 后端项目
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   ├── nest-cli.json
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml       # Docker编排文件
├── .gitignore
└── README.md
```

---

## 七、开发规范

### 7.1 Git分支规范

- `main`: 生产分支
- `develop`: 开发分支
- `feature/*`: 功能分支
- `bugfix/*`: Bug修复分支
- `release/*`: 发布分支

### 7.2 Commit规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

### 7.3 代码规范

- ESLint + Prettier 代码格式化
- TypeScript 严格模式
- 组件拆分原则: 单个文件不超过500行

---

## 八、项目里程碑

| 阶段 | 内容 | 预计工时 |
|------|------|----------|
| 项目初始化 | 创建项目结构、配置开发环境 | 1天 |
| 数据库设计 | Prisma模型设计、迁移 | 0.5天 |
| 后端开发 | 认证、记账、分类、预算模块 | 3天 |
| 前端开发 | 页面组件、接口对接 | 3天 |
| 测试验证 | 功能测试、修复Bug | 1天 |
| 部署上线 | Docker部署、验证 | 0.5天 |

---

**文档版本：v1.0**
**创建日期：2026-05-25**
**创建者：架构师**