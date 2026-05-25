import api from './api'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ApiResponse,
} from '../types'

export const authApi = {
  // 登录
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data)
    return response.data.data
  },

  // 注册
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<ApiResponse<User>>('/auth/register', data)
    return response.data.data
  },

  // 登出
  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  // 获取当前用户信息
  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/profile')
    return response.data.data
  },

  // 更新用户信息
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/auth/profile', data)
    return response.data.data
  },

  // 修改密码
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.put('/auth/password', data)
  },
}