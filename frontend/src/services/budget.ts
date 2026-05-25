import api from './api'
import type {
  Budget,
  CreateBudgetRequest,
  BudgetProgress,
  ApiResponse,
} from '../types'

export const budgetApi = {
  // 获取预算列表
  getList: async (): Promise<Budget[]> => {
    const response = await api.get<ApiResponse<Budget[]>>('/budgets')
    return response.data.data
  },

  // 获取当前月预算进度
  getCurrent: async (): Promise<BudgetProgress> => {
    const response = await api.get<ApiResponse<BudgetProgress>>('/budgets/current')
    return response.data.data
  },

  // 创建或更新预算
  createOrUpdate: async (data: CreateBudgetRequest): Promise<Budget> => {
    const response = await api.post<ApiResponse<Budget>>('/budgets', data)
    return response.data.data
  },

  // 删除预算
  delete: async (id: string): Promise<void> => {
    await api.delete(`/budgets/${id}`)
  },
}