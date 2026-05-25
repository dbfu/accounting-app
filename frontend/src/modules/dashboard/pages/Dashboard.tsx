import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Spin,
  Empty,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Radio,
  Tag,
  List,
  message,
  Space,
} from 'antd'
import {
  PayCircleOutlined,
  PlusCircleOutlined,
  WalletOutlined,
  PlusOutlined,
  EditOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { recordApi, categoryApi, budgetApi } from '../../../services'
import dayjs from 'dayjs'
import type { CreateRecordRequest, Record, RecordType } from '../../types'

export default function Dashboard() {
  const currentMonth = dayjs().format('YYYY-MM')
  const [modalVisible, setModalVisible] = useState(false)
  const [recordType, setRecordType] = useState<RecordType>('expense')
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  // 获取统计数据
  const { data: statistics, isLoading: statLoading } = useQuery({
    queryKey: ['statistics', currentMonth],
    queryFn: () => recordApi.getStatistics(currentMonth),
  })

  // 获取分类列表
  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  })

  // 获取预算进度
  const { data: budgetProgress } = useQuery({
    queryKey: ['budget', 'current'],
    queryFn: () => budgetApi.getCurrent(),
  })

  // 获取最近账单（最近5条）
  const { data: recentRecords } = useQuery({
    queryKey: ['records', { page: 1, pageSize: 5 }],
    queryFn: () => recordApi.getList({ page: 1, pageSize: 5 }),
  })

  const isLoading = statLoading || catLoading

  // 创建记录 mutation
  const createMutation = useMutation({
    mutationFn: recordApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      queryClient.invalidateQueries({ queryKey: ['budget'] })
      message.success('记账成功')
      setModalVisible(false)
      form.resetFields()
      setRecordType('expense')
    },
    onError: (error: unknown) => {
      message.error(error instanceof Error ? error.message : '记账失败')
    },
  })

  // 根据类型筛选分类
  const filteredCategories = (categories || []).filter((c) => c.type === recordType)

  // 打开记账弹窗
  const handleOpenModal = () => {
    form.resetFields()
    form.setFieldsValue({
      type: 'expense',
      amount: undefined,
      categoryId: undefined,
      recordDate: dayjs(),
      description: '',
    })
    setRecordType('expense')
    setModalVisible(true)
  }

  // 提交记账
  const handleSubmit = async (values: CreateRecordRequest) => {
    if (!values.amount || values.amount <= 0) {
      message.error('金额必须大于0')
      return
    }
    if (!values.categoryId) {
      message.error('请选择分类')
      return
    }
    const data: CreateRecordRequest = {
      type: values.type,
      amount: values.amount,
      categoryId: values.categoryId,
      recordDate: values.recordDate.format('YYYY-MM-DD'),
      description: values.description || undefined,
    }
    createMutation.mutate(data)
  }

  // 饼图配置
  const getPieOption = () => {
    if (!statistics?.categoryBreakdown?.length) return {}
    return {
      title: {
        text: '支出分类占比',
        left: 'center',
        textStyle: { fontSize: 14 },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ¥{c} ({d}%)',
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          data: statistics.categoryBreakdown.map((item) => ({
            name: item.categoryName,
            value: item.amount,
            itemStyle: { color: item.color },
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: true,
            formatter: '{b}: {d}%',
          },
        },
      ],
    }
  }

  return (
    <Spin spinning={isLoading}>
      {/* 快速记账按钮 */}
      <div className="mb-4">
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleOpenModal}
          className="bg-green-500 hover:bg-green-600"
        >
          快速记账
        </Button>
      </div>

      {/* 收支概览卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="本月收入"
              value={statistics?.totalIncome || 0}
              precision={2}
              prefix={<PlusCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="本月支出"
              value={statistics?.totalExpense || 0}
              precision={2}
              prefix={<PayCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="本月结余"
              value={statistics?.balance || 0}
              precision={2}
              prefix={<WalletOutlined />}
              valueStyle={{ color: statistics?.balance >= 0 ? '#1890ff' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 预算进度 */}
      {budgetProgress && (
        <Card title="本月预算进度" className="mt-4 shadow-sm">
          <Progress
            percent={budgetProgress.percentage > 100 ? 100 : budgetProgress.percentage}
            status={budgetProgress.isOverBudget ? 'exception' : 'active'}
            strokeColor={
              budgetProgress.isOverBudget
                ? '#ff4d4f'
                : budgetProgress.percentage > 80
                ? '#faad14'
                : '#52c41a'
            }
            format={(percent) => `${percent?.toFixed(0)}%`}
          />
          <div className="mt-2 flex justify-between text-gray-500">
            <span>
              <span className="text-red-500">已支出 ¥{budgetProgress.spent.toFixed(2)}</span>
            </span>
            <span>预算 ¥{budgetProgress.budget.amount.toFixed(2)}</span>
            <span className={budgetProgress.isOverBudget ? 'text-red-500' : 'text-green-500'}>
              {budgetProgress.isOverBudget ? '超支' : '剩余'} ¥{Math.abs(budgetProgress.remaining).toFixed(2)}
            </span>
          </div>
        </Card>
      )}

      {/* 最近账单 */}
      <Card title="最近账单" className="mt-4 shadow-sm" extra={<a href="/records">查看全部</a>}>
        {recentRecords?.list?.length > 0 ? (
          <List
            dataSource={recentRecords.list.slice(0, 5)}
            renderItem={(record: Record) => (
              <List.Item>
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-3">
                    <Tag color={record.category.color}>{record.category.name}</Tag>
                    <span className="text-gray-500 text-sm">{record.recordDate}</span>
                    {record.description && (
                      <span className="text-gray-400 text-sm truncate max-w-32">{record.description}</span>
                    )}
                  </div>
                  <span
                    className="font-bold"
                    style={{ color: record.type === 'income' ? '#52c41a' : '#ff4d4f' }}
                  >
                    {record.type === 'income' ? '+' : '-'}¥{record.amount.toFixed(2)}
                  </span>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无账单记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      {/* 支出分类饼图 */}
      <Card title="支出分类占比" className="mt-4 shadow-sm">
        {statistics?.categoryBreakdown?.length > 0 ? (
          <ReactECharts option={getPieOption()} style={{ height: 300 }} />
        ) : (
          <Empty description="暂无支出数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      {/* 快速记账弹窗 */}
      <Modal
        title="快速记账"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={400}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Radio.Group onChange={(e) => setRecordType(e.target.value)}>
              <Radio value="expense" className="text-red-500">支出</Radio>
              <Radio value="income" className="text-green-500">收入</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="amount"
            label="金额"
            rules={[
              { required: true, message: '请输入金额' },
              { type: 'number', min: 0.01, message: '金额必须大于0' },
            ]}
          >
            <InputNumber
              min={0.01}
              precision={2}
              prefix="¥"
              className="w-full"
              placeholder="输入金额"
            />
          </Form.Item>
          <Form.Item
            name="categoryId"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select
              placeholder="选择分类"
              options={filteredCategories.map((c) => ({
                label: c.name,
                value: c.id,
              }))}
            />
          </Form.Item>
          <Form.Item name="recordDate" label="日期" rules={[{ required: true, message: '请选择日期' }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="description" label="备注">
            <Input.TextArea rows={2} placeholder="输入备注（可选）" maxLength={100} showCount />
          </Form.Item>
          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending}
                className="bg-green-500 hover:bg-green-600"
              >
                确认记账
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  )
}