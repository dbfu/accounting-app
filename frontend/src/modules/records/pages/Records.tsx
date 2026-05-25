import { useState } from 'react'
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
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { recordApi, categoryApi } from '../../services'
import type { Record, CreateRecordRequest, RecordType } from '../../types'
import dayjs from 'dayjs'

export default function Records() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [month, setMonth] = useState<string | undefined>(dayjs().format('YYYY-MM'))
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Record | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['records', { page, pageSize, month }],
    queryFn: () => recordApi.getList({ page, pageSize, month }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: recordApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      message.success('添加成功')
      setModalVisible(false)
      form.resetFields()
    },
    onError: (error: unknown) => {
      message.error(error instanceof Error ? error.message : '添加失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateRecordRequest }) =>
      recordApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      message.success('更新成功')
      setModalVisible(false)
      setEditingRecord(null)
      form.resetFields()
    },
    onError: (error: unknown) => {
      message.error(error instanceof Error ? error.message : '更新失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: recordApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] })
      queryClient.invalidateQueries({ queryKey: ['statistics'] })
      message.success('删除成功')
    },
    onError: (error: unknown) => {
      message.error(error instanceof Error ? error.message : '删除失败')
    },
  })

  const expenseCategories = (categories || []).filter((c) => c.type === 'expense')
  const incomeCategories = (categories || []).filter((c) => c.type === 'income')

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    form.setFieldsValue({
      type: 'expense',
      recordDate: dayjs(),
    })
    setModalVisible(true)
  }

  const handleEdit = (record: Record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      type: record.type,
      amount: record.amount,
      description: record.description,
      recordDate: dayjs(record.recordDate),
      categoryId: record.categoryId,
    })
    setModalVisible(true)
  }

  const handleSubmit = async (values: CreateRecordRequest) => {
    const data = {
      ...values,
      recordDate: values.recordDate.format('YYYY-MM-DD'),
    }
    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const columns = [
    {
      title: '日期',
      dataIndex: 'recordDate',
      key: 'recordDate',
      width: 120,
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
      render: (amount: number, record: Record) => (
        <span style={{ color: record.type === 'income' ? '#52c41a' : '#ff4d4f' }}>
          ¥{amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: '备注',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
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
            title="确定删除?"
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
      <Card
        title="记账管理"
        extra={
          <Space>
            <DatePicker
              picker="month"
              value={month ? dayjs(month) : null}
              onChange={(date) => setMonth(date?.format('YYYY-MM') || undefined)}
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              记一笔
            </Button>
          </Space>
        }
      >
        {data?.summary && (
          <div className="mb-4 flex gap-4">
            <Tag color="green">收入 ¥{data.summary.totalIncome.toFixed(2)}</Tag>
            <Tag color="red">支出 ¥{data.summary.totalExpense.toFixed(2)}</Tag>
            <Tag color="blue">结余 ¥{data.summary.balance.toFixed(2)}</Tag>
          </div>
        )}
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
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑记录' : '记一笔'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="expense">支出</Radio>
              <Radio value="income">收入</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} prefix="¥" className="w-full" />
          </Form.Item>
          <Form.Item name="categoryId" label="分类" rules={[{ required: true }]}>
            <Form.Item name="type" noStyle>
              <Select
                options={
                  (form.getFieldValue('type') === 'income'
                    ? incomeCategories
                    : expenseCategories
                  ).map((c) => ({
                    label: c.name,
                    value: c.id,
                  }))
                }
              />
            </Form.Item>
          </Form.Item>
          <Form.Item name="recordDate" label="日期" rules={[{ required: true }]}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="description" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
                确定
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  )
}