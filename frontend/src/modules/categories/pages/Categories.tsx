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
  Select,
  Radio,
  Tag,
  Popconfirm,
  message,
  Spin,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { categoryApi } from '../../services'
import type { Category, CreateCategoryRequest, CategoryType } from '../../types'
import { DEFAULT_CATEGORIES } from '../../constants'

export default function Categories() {
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      message.success('添加成功')
      setModalVisible(false)
      form.resetFields()
    },
    onError: (error: unknown) => {
      message.error(error instanceof Error ? error.message : '添加失败')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCategoryRequest }) =>
      categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      message.success('更新成功')
      setModalVisible(false)
      setEditingCategory(null)
      form.resetFields()
    },
    onError: (error: unknown) => {
      message.error(error instanceof Error ? error.message : '更新失败')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      message.success('删除成功')
    },
    onError: (error: unknown) => {
      message.error(error instanceof Error ? error.message : '删除失败')
    },
  })

  const handleAdd = () => {
    setEditingCategory(null)
    form.resetFields()
    form.setFieldsValue({ type: 'expense' })
    setModalVisible(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    form.setFieldsValue({
      name: category.name,
      type: category.type,
      color: category.color,
    })
    setModalVisible(true)
  }

  const handleSubmit = async (values: CreateCategoryRequest) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const handleInitDefault = async () => {
    const allCategories = categories || []
    if (allCategories.length > 0) {
      message.warning('已有分类数据，无需初始化')
      return
    }

    let successCount = 0
    for (const cat of DEFAULT_CATEGORIES.expense) {
      try {
        await categoryApi.create({ ...cat, type: 'expense' })
        successCount++
      } catch {
        // ignore
      }
    }
    for (const cat of DEFAULT_CATEGORIES.income) {
      try {
        await categoryApi.create({ ...cat, type: 'income' })
        successCount++
      } catch {
        // ignore
      }
    }
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    message.success(`成功初始化 ${successCount} 个分类`)
  }

  const columns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: CategoryType) => (
        <Tag color={type === 'income' ? 'green' : 'red'}>
          {type === 'income' ? '收入' : '支出'}
        </Tag>
      ),
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      render: (color: string | null) =>
        color ? (
          <Tag color={color}>
            <span style={{ color: '#fff' }}>{color}</span>
          </Tag>
        ) : null,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Category) => (
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
        title="分类管理"
        extra={
          <Space>
            <Button onClick={handleInitDefault}>初始化默认分类</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增分类
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={categories || []}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="分类名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="expense">支出</Radio>
              <Radio value="income">收入</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="color" label="颜色">
            <Select
              options={[
                { label: '红色', value: '#FF6B6B' },
                { label: '绿色', value: '#52c41a' },
                { label: '蓝色', value: '#1890ff' },
                { label: '橙色', value: '#fa8c16' },
                { label: '紫色', value: '#722ed1' },
                { label: '青色', value: '#13c2c2' },
                { label: '灰色', value: '#bfbfbf' },
              ]}
              allowClear
            />
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