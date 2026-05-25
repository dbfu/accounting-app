import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message, Progress } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { authApi } from '../../../services'
import type { RegisterRequest } from '../../types'

// 密码强度检查函数
function checkPasswordStrength(password: string): { score: number; checks: { hasLetter: boolean; hasNumber: boolean; hasMinLength: boolean } } {
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasMinLength = password.length >= 6
  const score = [hasLetter, hasNumber, hasMinLength].filter(Boolean).length
  return { score, checks: { hasLetter, hasNumber, hasMinLength } }
}

export default function Register() {
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, checks: { hasLetter: false, hasNumber: false, hasMinLength: false } })
  const navigate = useNavigate()

  const handleRegister = async (values: RegisterRequest) => {
    // 验证密码强度
    const strength = checkPasswordStrength(values.password)
    if (!strength.checks.hasLetter || !strength.checks.hasNumber) {
      message.error('密码必须包含字母和数字')
      return
    }

    setLoading(true)
    try {
      await authApi.register(values)
      message.success('注册成功，请登录')
      navigate('/login')
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : '注册失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const strength = checkPasswordStrength(e.target.value)
    setPasswordStrength(strength)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-96 shadow-lg rounded-xl" title={<div className="text-center text-xl font-bold">记账本 - 注册</div>}>
        <Form onFinish={handleRegister} size="large">
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 20, message: '用户名长度3-20字符' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线' },
            ]}
            hasFeedback
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
            hasFeedback
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              onChange={handlePasswordChange}
            />
          </Form.Item>
          {passwordStrength.score > 0 && (
            <div className="mb-4 px-1">
              <Progress
                percent={passwordStrength.score * 33.33}
                strokeColor={passwordStrength.score === 3 ? '#52c41a' : passwordStrength.score === 2 ? '#faad14' : '#ff4d4f'}
                showInfo={false}
                size="small"
              />
              <div className="flex gap-4 mt-1 text-xs">
                <span className={passwordStrength.checks.hasMinLength ? 'text-green-500' : 'text-gray-400'}>
                  {passwordStrength.checks.hasMinLength && <CheckCircleOutlined />} 至少6位
                </span>
                <span className={passwordStrength.checks.hasLetter ? 'text-green-500' : 'text-gray-400'}>
                  {passwordStrength.checks.hasLetter && <CheckCircleOutlined />} 包含字母
                </span>
                <span className={passwordStrength.checks.hasNumber ? 'text-green-500' : 'text-gray-400'}>
                  {passwordStrength.checks.hasNumber && <CheckCircleOutlined />} 包含数字
                </span>
              </div>
            </div>
          )}
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次密码不一致'))
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block className="bg-green-500 hover:bg-green-600">
              注册
            </Button>
          </Form.Item>
          <div className="text-center">
            <a className="text-green-600" onClick={() => navigate('/login')}>已有账号？去登录</a>
          </div>
        </Form>
      </Card>
    </div>
  )
}