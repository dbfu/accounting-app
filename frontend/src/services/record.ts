import api from './api'
import type {
  Record,
  CreateRecordRequest,
  UpdateRecordRequest,
  RecordListParams,
  RecordListResponse,
  StatisticsResponse,
  TrendResponse,
  ApiResponse,
} from '../types'

export const recordApi = {
  // 获取记账记录列表
  getList: async (params: RecordListParams): Promise<RecordListResponse> => {
    const response = await api.get<ApiResponse<RecordListResponse>>('/records', { params })
    return response.data.data
  },

  // 获取单条记录
  getById: async (id: string): Promise<Record> => {
    const response = await api.get<ApiResponse<Record>>(`/records/${id}`)
    return response.data.data
  },

  // 创建记录
  create: async (data: CreateRecordRequest): Promise<Record> => {
    const response = await api.post<ApiResponse<Record>>('/records', data)
    return response.data.data
  },

  // 更新记录
  update: async (id: string, data: UpdateRecordRequest): Promise<Record> => {
    const response = await api.put<ApiResponse<Record>>(`/records/${id}`, data)
    return response.data.data
  },

  // 删除记录
  delete: async (id: string): Promise<void> => {
    await api.delete(`/records/${id}`)
  },

  // 获取统计数据
  getStatistics: async (month: string): Promise<StatisticsResponse> => {
    const response = await api.get<ApiResponse<StatisticsResponse>>('/records/statistics', {
      params: { month },
    })
    return response.data.data
  },

  // 获取趋势数据
  getTrend: async (months: number = 6): Promise<TrendResponse> => {
    const response = await api.get<ApiResponse<TrendResponse>>('/records/trend', {
      params: { months },
    })
    return response.data.data
  },
}