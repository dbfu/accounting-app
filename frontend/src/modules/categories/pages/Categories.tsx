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
  Tabs,
  Row,
  Col,
  Empty,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { categoryApi } from '../../../services'
import type { Category, CreateCategoryRequest, CategoryType } from '../../types'

export default function Categories() {
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  // 获取分类列表
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  })

  // 创建分类 mutation
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

  // 更新分类 mutation
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

  // 删除分类 mutation
  const deleteMutation = useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      message.success('删除成功')
    },
    onError: (error: unknown) => {
      const errorMsg = error instanceof Error ? error.message : '删除失败'
      // 如果有关联记录，提示用户
      if (errorMsg.includes('关联') || errorMsg.includes('记录')) {
        message.warning(errorMsg)
      } else {
        message.error(errorMsg)
      }
    },
  })

  // 打开添加弹窗
  const handleAdd = (type: CategoryType = 'expense') => {
    setEditingCategory(null)
    form.resetFields()
    form.setFieldsValue({ type })
    setModalVisible(true)
  }

  // 打开编辑弹窗
  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    form.setFieldsValue({
      name: category.name,
      type: category.type,
      color: category.color,
    })
    setModalVisible(true)
  }

  // 提交表单
  const handleSubmit = async (values: CreateCategoryRequest) => {
    // 验证名称
    if (!values.name || values.name.trim().length === 0) {
      message.error('请输入分类名称')
      return
    }
    if (values.name.length > 20) {
      message.error('分类名称不能超过20字符')
      return
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  // 删除分类
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  // 表格列配置
  const columns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Category) => (
        <Tag color={record.color} className="px-3 py-1">
          {name}
        </Tag>
      ),
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      render: (color: string | null) =>
        color ? (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: color }}
            />
            <span className="text-gray-500">{color}</span>
          </div>
        ) : (
          <span className="text-gray-400">未设置</span>
        ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
      render: (order: number) => order || 0,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Category) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定删除此分类?"
            description={record.user ? '删除后将无法恢复' : '系统默认分类可以删除'}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // 按类型分组
  const expenseCategories = (categories || []).filter((c) => c.type === 'expense')
  const incomeCategories = (categories || []).filter((c) => c.type === 'income')

  // 颜色选项
  const colorOptions = [
    { label: '红色', value: '#FF6B6B' },
    { label: '橙色', value: '#fa8c16' },
    { label: '黄色', value: '#fadb14' },
    { label: '绿色', value: '#52c41a' },
    { label: '青色', value: '#13c2c2' },
    { label: '蓝色', value: '#1890ff' },
    { label: '紫色', value: '#722ed1' },
    { label: '粉色', value: '#eb2f96' },
    { label: '灰色', value: '#bfbfbf' },
  ]

  return (
    <Spin spinning={isLoading}>
      <Card
        title="分类管理"
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd('expense')} className="bg-green-500 hover:bg-green-600">
              新增分类
            </Button>
          </Space>
        }
      >
        <Tabs
          defaultActiveKey="expense"
          items={[
            {
              key: 'expense',
              label: (
                <span className="text-red-500">
                  支出分类 ({expenseCategories.length})
                </span>
              ),
              children: (
                <div>
                  {expenseCategories.length > 0 ? (
                    <Table
                      columns={columns}
                      dataSource={expenseCategories}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                    />
                  ) : (
                    <Empty description="暂无支出分类">
                      <Button type="primary" onClick={() => handleAdd('expense')}>
                        添加支出分类
                      </Button>
                    </Empty>
                  )}
                </div>
              ),
            },
            {
              key: 'income',
              label: (
                <span className="text-green-500">
                  收入分类 ({incomeCategories.length})
                </span>
              ),
              children: (
                <div>
                  {incomeCategories.length > 0 ? (
                    <Table
                      columns={columns}
                      dataSource={incomeCategories}
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                    />
                  ) : (
                    <Empty description="暂无收入分类">
                      <Button type="primary" onClick={() => handleAdd('income')}>
                        添加收入分类
                      </Button>
                    </Empty>
                  )}
                </div>
              ),
            },
          ]}
        />

        {/* 分类可视化展示 */}
        <Card type="inner" title="分类预览" className="mt-4">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div className="mb-2 text-gray-500">支出分类：</div>
              <div className="flex flex-wrap gap-2">
                {expenseCategories.map((cat) => (
                  <Tag
                    key={cat.id}
                    color={cat.color}
                    className="px-3 py-1 cursor-pointer hover:opacity-80"
                    onClick={() => handleEdit(cat)}
                  >
                    {cat.name}
                  </Tag>
                ))}
              </div>
            </Col>
            <Col span={24}>
              <div className="mb-2 text-gray-500">收入分类：</div>
              <div className="flex flex-wrap gap-2">
                {incomeCategories.map((cat) => (
                  <Tag
                    key={cat.id}
                    color={cat.color}
                    className="px-3 py-1 cursor-pointer hover:opacity-80"
                    onClick={() => handleEdit(cat)}
                  >
                    {cat.name}
                  </Tag>
                ))}
              </div>
            </Col>
          </Row>
        </Card>
      </Card>

      {/* 分类弹窗 */}
      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingCategory(null)
          form.resetFields()
        }}
        footer={null}
        width={400}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="name"
            label="分类名称"
            rules={[
              { required: true, message: '请输入分类名称' },
              { max: 20, message: '分类名称不能超过20字符' },
            ]}
          >
            <Input placeholder="输入分类名称" maxLength={20} showCount />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Radio.Group>
              <Radio value="expense" className="text-red-500">支出</Radio>
              <Radio value="income" className="text-green-500">收入</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="color" label="颜色">
            <Select
              placeholder="选择颜色"
              options={colorOptions}
              allowClear
            />
          </Form.Item>
          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setModalVisible(false)
                setEditingCategory(null)
                form.resetFields()
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