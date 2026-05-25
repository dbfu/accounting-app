import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  InputNumber,
  Button,
  Progress,
  DatePicker,
  Spin,
  message,
  Empty,
  Alert,
  Row,
  Col,
  List,
  Popconfirm,
  Tag,
  Statistic,
} from 'antd'
import { DeleteOutlined, SettingOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { budgetApi, recordApi } from '../../../services'
import dayjs from 'dayjs'
import type { Budget } from '../../types'

export default function Budget() {
  const [amount, setAmount] = useState<number | null>(null)
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
  const queryClient = useQueryClient()

  // 获取当前月预算进度
  const { data: budgetProgress, isLoading } = useQuery({
    queryKey: ['budget', 'current'],
    queryFn: () => budgetApi.getCurrent(),
  })

  // 获取预算历史列表
  const { data: budgetList } = useQuery({
    queryKey: ['budget', 'list'],
    queryFn: () => budgetApi.getList(),
  })

  // 获取统计数据
  const { data: statistics } = useQuery({
    queryKey: ['statistics', month],
    queryFn: () => recordApi.getStatistics(month),
  })

  // 创建/更新预算 mutation
  const createMutation = useMutation({
    mutationFn: budgetApi.createOrUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] })
      message.success('预算设置成功')
      setAmount(null)
    },
    onError: (error: unknown) => {
      message.error(error instanceof Error ? error.message : '设置失败')
    },
  })

  // 删除预算 mutation
  const deleteMutation = useMutation({
    mutationFn: budgetApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget'] })
      message.success('预算已删除')
    },
    onError: (error: unknown) => {
      message.error(error instanceof Error ? error.message : '删除失败')
    },
  })

  // 设置预算
  const handleSetBudget = () => {
    if (!amount || amount <= 0) {
      message.warning('请输入有效的预算金额')
      return
    }
    createMutation.mutate({ amount, month })
  }

  // 删除预算
  const handleDeleteBudget = (id: string) => {
    deleteMutation.mutate(id)
  }

  // 计算进度条状态
  const getProgressStatus = (percentage: number, isOverBudget: boolean) => {
    if (isOverBudget) return 'exception'
    if (percentage > 80) return 'active'
    return 'success'
  }

  // 计算进度条颜色
  const getProgressColor = (percentage: number, isOverBudget: boolean) => {
    if (isOverBudget) return '#ff4d4f'
    if (percentage > 80) return '#faad14'
    return '#52c41a'
  }

  return (
    <Spin spinning={isLoading}>
      <Row gutter={[16, 16]}>
        {/* 设置预算 */}
        <Col xs={24} lg={8}>
          <Card title="设置预算" className="shadow-sm">
            <div className="space-y-4">
              <div>
                <div className="text-gray-500 mb-2">选择月份</div>
                <DatePicker
                  picker="month"
                  value={dayjs(month)}
                  onChange={(date) => setMonth(date?.format('YYYY-MM') || dayjs().format('YYYY-MM'))}
                  className="w-full"
                  allowClear={false}
                />
              </div>
              <div>
                <div className="text-gray-500 mb-2">预算金额</div>
                <InputNumber
                  min={0.01}
                  precision={2}
                  prefix="¥"
                  value={amount}
                  onChange={setAmount}
                  className="w-full"
                  placeholder="输入预算金额"
                />
              </div>
              <Button
                type="primary"
                onClick={handleSetBudget}
                loading={createMutation.isPending}
                block
                className="bg-green-500 hover:bg-green-600"
              >
                设置预算
              </Button>
            </div>
          </Card>
        </Col>

        {/* 当前预算进度 */}
        <Col xs={24} lg={16}>
          <Card title="本月预算进度" className="shadow-sm">
            {budgetProgress ? (
              <div>
                {/* 超支警告 */}
                {budgetProgress.isOverBudget && (
                  <Alert
                    type="error"
                    message={<span><WarningOutlined /> 超支警告</span>}
                    description={`本月已超支 ¥${(budgetProgress.spent - budgetProgress.budget.amount).toFixed(2)}, 请控制支出！`}
                    className="mb-4"
                    showIcon
                  />
                )}

                {/* 进度提示 */}
                {budgetProgress.percentage > 80 && !budgetProgress.isOverBudget && (
                  <Alert
                    type="warning"
                    message={<span><WarningOutlined /> 预算提醒</span>}
                    description={`本月支出已达预算的 ${budgetProgress.percentage.toFixed(0)}%, 请注意控制支出`}
                    className="mb-4"
                    showIcon
                  />
                )}

                {/* 进度条 */}
                <div className="mb-4">
                  <Progress
                    percent={budgetProgress.percentage > 100 ? 100 : budgetProgress.percentage}
                    status={getProgressStatus(budgetProgress.percentage, budgetProgress.isOverBudget)}
                    strokeColor={getProgressColor(budgetProgress.percentage, budgetProgress.isOverBudget)}
                    format={(percent) => (
                      <span className={budgetProgress.isOverBudget ? 'text-red-500' : ''}>
                        {percent?.toFixed(0)}%
                      </span>
                    )}
                  />
                </div>

                {/* 详细数据 */}
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="预算金额"
                      value={budgetProgress.budget.amount}
                      precision={2}
                      prefix="¥"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="已支出"
                      value={budgetProgress.spent}
                      precision={2}
                      prefix="¥"
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title={budgetProgress.isOverBudget ? '超支' : '剩余'}
                      value={Math.abs(budgetProgress.remaining)}
                      precision={2}
                      prefix="¥"
                      valueStyle={{ color: budgetProgress.isOverBudget ? '#ff4d4f' : '#52c41a' }}
                    />
                  </Col>
                </Row>

                {/* 分类支出详情 */}
                {statistics?.categoryBreakdown?.length > 0 && (
                  <Card type="inner" title="支出分类明细" className="mt-4">
                    <List
                      dataSource={statistics.categoryBreakdown}
                      renderItem={(item) => (
                        <List.Item>
                          <div className="flex justify-between items-center w-full">
                            <Tag color={item.color}>{item.categoryName}</Tag>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">¥{item.amount.toFixed(2)}</span>
                              <span className="text-xs text-gray-400">{item.percentage.toFixed(1)}%</span>
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>
                )}
              </div>
            ) : (
              <Empty
                description="暂未设置本月预算"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <div className="flex gap-2 items-end">
                  <InputNumber
                    min={0.01}
                    precision={2}
                    prefix="¥"
                    value={amount}
                    onChange={setAmount}
                    placeholder="输入金额"
                  />
                  <Button
                    type="primary"
                    onClick={handleSetBudget}
                    loading={createMutation.isPending}
                    className="bg-green-500"
                  >
                    立即设置
                  </Button>
                </div>
              </Empty>
            )}
          </Card>
        </Col>

        {/* 预算历史 */}
        <Col span={24}>
          <Card title="预算历史" className="shadow-sm">
            {budgetList && budgetList.length > 0 ? (
              <List
                dataSource={budgetList.sort((a: Budget, b: Budget) => b.month.localeCompare(a.month))}
                renderItem={(budget: Budget) => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        key="delete"
                        title="确定删除此预算?"
                        onConfirm={() => handleDeleteBudget(budget.id)}
                      >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                      </Popconfirm>,
                    ]}
                  >
                    <div className="flex items-center gap-4">
                      <Tag color="blue">{budget.month}</Tag>
                      <span className="font-medium">预算 ¥{budget.amount.toFixed(2)}</span>
                      <span className="text-gray-400 text-sm">
                        {dayjs(budget.createdAt).format('YYYY-MM-DD HH:mm')}
                      </span>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无预算历史" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>
      </Row>
    </Spin>
  )
}