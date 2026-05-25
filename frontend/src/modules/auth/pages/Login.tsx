import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message, Checkbox } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { authApi } from '../../../services'
import { useAuthStore } from '../store/authStore'
import type { LoginRequest } from '../../../types'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  // 自动填充上次保存的用户名
  const savedUsername = localStorage.getItem('saved_username') || ''

  const handleLogin = async (values: LoginRequest & { remember?: boolean }) => {
    setLoading(true)
    try {
      const result = await authApi.login({ username: values.username, password: values.password })
      setAuth(result.user, result.accessToken)

      // 保存用户名选项
      if (values.remember) {
        localStorage.setItem('saved_username', values.username)
      } else {
        localStorage.removeItem('saved_username')
      }

      message.success('登录成功')
      navigate('/')
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-96 shadow-lg rounded-xl" title={<div className="text-center text-xl font-bold">记账本</div>}>
        <Form
          onFinish={handleLogin}
          size="large"
          initialValues={{ username: savedUsername, remember: !!savedUsername }}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 20, message: '用户名长度3-20字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>记住用户名</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block className="bg-green-500 hover:bg-green-600">
              登录
            </Button>
          </Form.Item>
          <div className="text-center">
            <a className="text-green-600" onClick={() => navigate('/register')}>没有账号？去注册</a>
          </div>
        </Form>
      </Card>
    </div>
  )
}