// 用户相关类型
export interface User {
  id: string
  username: string
  email: string
  avatar: string | null
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface UpdateProfileRequest {
  username?: string
  email?: string
  avatar?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

// 分类相关类型
export type CategoryType = 'income' | 'expense'

export interface Category {
  id: string
  name: string
  type: CategoryType
  icon: string | null
  color: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryRequest {
  name: string
  type: CategoryType
  icon?: string
  color?: string
  sortOrder?: number
}

export interface UpdateCategoryRequest {
  name?: string
  type?: CategoryType
  icon?: string
  color?: string
  sortOrder?: number
}

// 记账记录相关类型
export type RecordType = 'income' | 'expense'

export interface Record {
  id: string
  type: RecordType
  amount: number
  description: string | null
  recordDate: string
  categoryId: string
  category: Category
  createdAt: string
  updatedAt: string
}

export interface CreateRecordRequest {
  type: RecordType
  amount: number
  description?: string
  recordDate: string
  categoryId: string
}

export interface UpdateRecordRequest {
  type?: RecordType
  amount?: number
  description?: string
  recordDate?: string
  categoryId?: string
}

export interface RecordListParams {
  page?: number
  pageSize?: number
  month?: string
  type?: RecordType
  categoryId?: string
  keyword?: string
}

export interface RecordListResponse {
  list: Record[]
  total: number
  page: number
  pageSize: number
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
  }
}

// 统计相关类型
export interface CategoryBreakdown {
  categoryId: string
  categoryName: string
  amount: number
  percentage: number
  color: string
}

export interface StatisticsResponse {
  month: string
  totalIncome: number
  totalExpense: number
  balance: number
  categoryBreakdown: CategoryBreakdown[]
}

export interface TrendItem {
  month: string
  income: number
  expense: number
  balance: number
}

export interface TrendResponse {
  list: TrendItem[]
}

// 预算相关类型
export interface Budget {
  id: string
  amount: number
  month: string
  createdAt: string
  updatedAt: string
}

export interface CreateBudgetRequest {
  amount: number
  month: string
}

export interface BudgetProgress {
  budget: Budget
  spent: number
  remaining: number
  percentage: number
  isOverBudget: boolean
}

// API响应类型
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}