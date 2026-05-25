import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Radio,
  Tag,
  Popconfirm,
  message,
  Spin,
  Row,
  Col,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { recordApi, categoryApi } from '../../../services'
import type { Record, CreateRecordRequest, RecordType, Category } from '../../types'
import dayjs from 'dayjs'

export default function Records() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [month, setMonth] = useState<string | undefined>(dayjs().format('YYYY-MM'))
  const [typeFilter, setTypeFilter] = useState<RecordType | undefined>()
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>()
  const [keyword, setKeyword] = useState<string | undefined>()
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Record | null>(null)
  const [recordType, setRecordType] = useState<RecordType>('expense')
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  // 获取记录列表
  const { data, isLoading } = useQuery({
    queryKey: ['records', { page, pageSize, month, typeFilter, categoryFilter, keyword }],
    queryFn: () =>
      recordApi.getList({
        page,
        pageSize,
        month,
        type: typeFilter,
        categoryId: categoryFilter,
        keyword,
      }),
  })

  // 获取分类列表
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  })

  // 根据类型筛选分类
  const filteredCategories = (categories || []).filter((c: Category) => c.type === recordType)
  const expenseCategories = (categories || []).filter((c: Category) => c.type === 'expense')
  const incomeCategories = (categories || []).filter((c: Category) => c.type === 'income')

  // 创建记录 mutation
  const createMutation = useMutation({
    mutationFn: recordApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      queryClient.invalidateQueries({ queryKey: ['budget'] })
      message.success('添加成功')
      setModalVisible(false)
      form.resetFields()
      setRecordType('expense')
    },
    onError: (error: unknown) => {
      message.error(error instanceof Error ? error.message : '添加失败')
    },
  })

  // 更新记录 mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateRecordRequest }) =>
      recordApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      queryClient.invalidateQueries({ queryKey: ['budget'] })
      message.success('更新成功')
      setModalVisible(false)
      setEditingRecord(null)
      form.resetFields()
      setRecordType('expense')
    },
    onError: (error: unknown) => {
      message.error(error instanceof Error ? error.message : '更新失败')
    },
  })

  // 删除记录 mutation
  const deleteMutation = useMutation({
    mutationFn: recordApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      queryClient.invalidateQueries({ queryKey: ['budget'] })
      message.success('删除成功')
    },
    onError: (error: unknown) => {
      message.error(error instanceof Error ? error.message : '删除失败')
    },
  })

  // 监听类型变化，清空分类选择
  useEffect(() => {
    if (modalVisible && !editingRecord) {
      form.setFieldValue('categoryId', undefined)
    }
  }, [recordType, modalVisible, form, editingRecord])

  // 打开添加弹窗
  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    form.setFieldsValue({
      type: 'expense',
      recordDate: dayjs(),
    })
    setRecordType('expense')
    setModalVisible(true)
  }

  // 打开编辑弹窗
  const handleEdit = (record: Record) => {
    setEditingRecord(record)
    setRecordType(record.type)
    form.setFieldsValue({
      type: record.type,
      amount: record.amount,
      description: record.description,
      recordDate: dayjs(record.recordDate),
      categoryId: record.categoryId,
    })
    setModalVisible(true)
  }

  // 提交表单
  const handleSubmit = async (values: CreateRecordRequest & { recordDate: dayjs.Dayjs }) => {
    // 验证金额
    if (!values.amount || values.amount <= 0) {
      message.error('金额必须大于0')
      return
    }
    // 验证分类
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

    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  // 搜索
  const handleSearch = () => {
    setPage(1)
    // 触发重新查询
  }

  // 清空筛选
  const handleClearFilters = () => {
    setMonth(dayjs().format('YYYY-MM'))
    setTypeFilter(undefined)
    setCategoryFilter(undefined)
    setKeyword(undefined)
    setPage(1)
  }

  // 表格列配置
  const columns = [
    {
      title: '日期',
      dataIndex: 'recordDate',
      key: 'recordDate',
      width: 120,
      sorter: (a: Record, b: Record) => dayjs(a.recordDate).unix() - dayjs(b.recordDate).unix(),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: RecordType) => (
        <Tag color={type === 'income' ? 'green' : 'red'}>
          {type === 'income' ? '收入' : '支出'}
        </Tag>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: { name: string; color: string | null }) => (
        <Tag color={category.color}>{category.name}</Tag>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      sorter: (a: Record, b: Record) => a.amount - b.amount,
      render: (amount: number, record: Record) => (
        <span style={{ color: record.type === 'income' ? '#52c41a' : '#ff4d4f' }}>
          {record.type === 'income' ? '+' : '-'}¥{amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: '备注',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string | null) => desc || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定删除这条记录?"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Spin spinning={isLoading}>
      <Card title="记账管理">
        {/* 筛选区域 */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={6}>
            <DatePicker
              picker="month"
              value={month ? dayjs(month) : null}
              onChange={(date) => setMonth(date?.format('YYYY-MM') || undefined)}
              allowClear
              placeholder="选择月份"
              className="w-full"
            />
          </Col>
          <Col xs={24} sm={4}>
            <Select
              value={typeFilter}
              onChange={(val) => setTypeFilter(val)}
              allowClear
              placeholder="类型"
              className="w-full"
              options={[
                { label: '收入', value: 'income' },
                { label: '支出', value: 'expense' },
              ]}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val)}
              allowClear
              placeholder="分类"
              className="w-full"
              options={(categories || []).map((c: Category) => ({
                label: `${c.name} (${c.type === 'income' ? '收入' : '支出'})`,
                value: c.id,
              }))}
            />
          </Col>
          <Col xs={24} sm={4}>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索备注"
              allowClear
              maxLength={50}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col xs={24} sm={4}>
            <Space>
              <Button onClick={handleClearFilters}>清空筛选</Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} className="bg-green-500 hover:bg-green-600">
                记一笔
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 汇总信息 */}
        {data?.summary && (
          <div className="mb-4 flex gap-4">
            <Tag color="green" className="px-3 py-1">
              收入 ¥{data.summary.totalIncome.toFixed(2)}
            </Tag>
            <Tag color="red" className="px-3 py-1">
              支出 ¥{data.summary.totalExpense.toFixed(2)}
            </Tag>
            <Tag color="blue" className="px-3 py-1">
              结余 ¥{data.summary.balance.toFixed(2)}
            </Tag>
          </div>
        )}

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={data?.list || []}
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total: data?.total || 0,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            },
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 记账弹窗 */}
      <Modal
        title={editingRecord ? '编辑记录' : '记一笔'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingRecord(null)
          form.resetFields()
          setRecordType('expense')
        }}
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
              options={filteredCategories.map((c: Category) => ({
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
              <Button onClick={() => {
                setModalVisible(false)
                setEditingRecord(null)
                form.resetFields()
                setRecordType('expense')
              }}>取消</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
                className="bg-green-500 hover:bg-green-600"
              >
                确定
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  )
}