import api from './api'
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ApiResponse,
} from '../types'

export const categoryApi = {
  // 获取所有分类
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories')
    return response.data.data
  },

  // 获取单个分类
  getById: async (id: string): Promise<Category> => {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`)
    return response.data.data
  },

  // 创建分类
  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post<ApiResponse<Category>>('/categories', data)
    return response.data.data
  },

  // 更新分类
  update: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data)
    return response.data.data
  },

  // 删除分类
  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`)
  },
}