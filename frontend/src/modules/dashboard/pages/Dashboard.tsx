import { useQuery } from '@tanstack/react-query'
import { Card, Row, Col, Statistic, Progress, Spin, Empty } from 'antd'
import {
  PayCircleOutlined,
  PlusCircleOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { recordApi, categoryApi, budgetApi } from '../../services'
import dayjs from 'dayjs'

export default function Dashboard() {
  const currentMonth = dayjs().format('YYYY-MM')

  const { data: statistics, isLoading: statLoading } = useQuery({
    queryKey: ['statistics', currentMonth],
    queryFn: () => recordApi.getStatistics(currentMonth),
  })

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  })

  const { data: budgetProgress } = useQuery({
    queryKey: ['budget', 'current'],
    queryFn: () => budgetApi.getCurrent(),
  })

  const isLoading = statLoading || catLoading

  const getPieOption = () => {
    if (!statistics?.categoryBreakdown) return {}
    return {
      title: {
        text: '支出分类占比',
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      series: [
        {
          type: 'pie',
          radius: '60%',
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
        },
      ],
    }
  }

  return (
    <Spin spinning={isLoading}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="本月收入"
              value={statistics?.totalIncome || 0}
              precision={2}
              prefix={<PlusCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="本月支出"
              value={statistics?.totalExpense || 0}
              precision={2}
              prefix={<PayCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="本月结余"
              value={statistics?.balance || 0}
              precision={2}
              prefix={<WalletOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {budgetProgress && (
        <Card title="预算进度" className="mt-4">
          <Progress
            percent={budgetProgress.percentage}
            status={budgetProgress.isOverBudget ? 'exception' : 'active'}
            format={(percent) => `${percent?.toFixed(0)}%`}
          />
          <div className="mt-2 text-gray-500">
            已花费 ¥{budgetProgress.spent.toFixed(2)} / 预算 ¥{budgetProgress.budget.amount.toFixed(2)}
          </div>
        </Card>
      )}

      <Card title="支出分类" className="mt-4">
        {statistics?.categoryBreakdown?.length > 0 ? (
          <ReactECharts option={getPieOption()} style={{ height: 300 }} />
        ) : (
          <Empty description="暂无数据" />
        )}
      </Card>

      <Card title="分类列表" className="mt-4">
        <Row gutter={[8, 8]}>
          {(categories || []).map((cat) => (
            <Col key={cat.id} span={4}>
              <div
                className="p-2 rounded text-center"
                style={{ backgroundColor: cat.color || '#f0f0f0' }}
              >
                <div className="text-white font-medium">{cat.name}</div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </Spin>
  )
}