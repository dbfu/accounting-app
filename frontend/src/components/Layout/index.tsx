import { useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout as AntLayout, Menu, Dropdown, Avatar, Spin, Badge } from 'antd'
import {
  HomeOutlined,
  BookOutlined,
  TagsOutlined,
  BarChartOutlined,
  WalletOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../modules/auth/store/authStore'
import { authApi, budgetApi } from '../../services'
import type { MenuProps } from 'antd'

const { Header, Sider, Content } = AntLayout

const menuItems: MenuProps['items'] = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: '首页概览',
  },
  {
    key: '/records',
    icon: <BookOutlined />,
    label: '记账管理',
  },
  {
    key: '/categories',
    icon: <TagsOutlined />,
    label: '分类管理',
  },
  {
    key: '/statistics',
    icon: <BarChartOutlined />,
    label: '数据统计',
  },
  {
    key: '/budget',
    icon: <WalletOutlined />,
    label: '预算管理',
  },
]

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, clearAuth, setUser } = useAuthStore()

  // 获取用户信息
  const { isLoading: userLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    onSuccess: (data) => {
      setUser(data)
    },
    onError: () => {
      clearAuth()
      navigate('/login')
    },
    retry: false,
    enabled: useAuthStore.getState().isAuthenticated,
  })

  // 获取预算进度（用于超支提示）
  const { data: budgetProgress } = useQuery({
    queryKey: ['budget', 'current'],
    queryFn: budgetApi.getCurrent,
    enabled: useAuthStore.getState().isAuthenticated,
  })

  // 登出
  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    clearAuth()
    navigate('/login')
  }

  // 用户菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: user?.username || '用户',
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  // 菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  // 获取当前选中的菜单
  const getSelectedKey = () => {
    const path = location.pathname
    if (path.startsWith('/records')) return '/records'
    if (path.startsWith('/categories')) return '/categories'
    if (path.startsWith('/statistics')) return '/statistics'
    if (path.startsWith('/budget')) return '/budget'
    return '/'
  }

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <AntLayout className="min-h-screen">
      <Sider
        width={200}
        className="bg-white shadow-sm"
        breakpoint="lg"
        collapsedWidth="80"
      >
        <div className="h-16 flex items-center justify-center text-lg font-bold border-b bg-green-500 text-white">
          记账本
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-none"
        />
      </Sider>
      <AntLayout>
        <Header className="bg-white px-6 flex items-center justify-end border-b shadow-sm">
          {/* 超支提示 */}
          {budgetProgress?.isOverBudget && (
            <Badge
              count={<span className="text-xs text-red-500">超支</span>}
              className="mr-4"
            >
              <WalletOutlined className="text-lg text-red-500" />
            </Badge>
          )}
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
              <Avatar
                icon={<UserOutlined />}
                src={user?.avatar}
                className="bg-green-500"
              />
              <span className="ml-2">{user?.username || '用户'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content className="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}