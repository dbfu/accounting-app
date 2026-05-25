// API基础地址
export const API_BASE_URL = '/api/v1'

// Token存储键
export const TOKEN_KEY = 'access_token'
export const USER_KEY = 'user_info'

// 分页默认配置
export const DEFAULT_PAGE_SIZE = 20

// 预置分类
export const DEFAULT_CATEGORIES = {
  expense: [
    { name: '餐饮', icon: 'food', color: '#FF6B6B' },
    { name: '交通', icon: 'car', color: '#4ECDC4' },
    { name: '购物', icon: 'shopping', color: '#45B7D1' },
    { name: '娱乐', icon: 'game', color: '#96CEB4' },
    { name: '住房', icon: 'home', color: '#FFEAA7' },
    { name: '医疗', icon: 'medicine', color: '#DDA0DD' },
    { name: '教育', icon: 'book', color: '#98D8C8' },
    { name: '通讯', icon: 'phone', color: '#F7DC6F' },
    { name: '其他', icon: 'other', color: '#BDC3C7' },
  ],
  income: [
    { name: '工资', icon: 'salary', color: '#27AE60' },
    { name: '奖金', icon: 'bonus', color: '#3498DB' },
    { name: '投资', icon: 'invest', color: '#9B59B6' },
    { name: '兼职', icon: 'parttime', color: '#E67E22' },
    { name: '其他', icon: 'other', color: '#BDC3C7' },
  ],
}

// 图标映射
export const ICON_MAP: Record<string, string> = {
  food: '🍽️',
  car: '🚗',
  shopping: '🛒',
  game: '🎮',
  home: '🏠',
  medicine: '💊',
  book: '📚',
  phone: '📱',
  salary: '💰',
  bonus: '🎁',
  invest: '📈',
  parttime: '💼',
  other: '📦',
}