import { Outlet, useNavigate } from 'react-router-dom'
import { Layout as AntLayout, Menu, Dropdown, Avatar } from 'antd'
import {
  HomeOutlined,
  BookOutlined,
  TagsOutlined,
  BarChartOutlined,
  WalletOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../modules/auth/store/authStore'
import { authApi } from '../services'
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
  const { user, clearAuth } = useAuthStore()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    clearAuth()
    navigate('/login')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  return (
    <AntLayout className="min-h-screen">
      <Sider width={200} className="bg-white">
        <div className="h-16 flex items-center justify-center text-lg font-bold border-b">
          记账本
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={['/']}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-none"
        />
      </Sider>
      <AntLayout>
        <Header className="bg-white px-6 flex items-center justify-end border-b">
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center cursor-pointer">
              <Avatar icon={<UserOutlined />} src={user?.avatar} />
              <span className="ml-2">{user?.username || '用户'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content className="p-6 bg-gray-50">
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}