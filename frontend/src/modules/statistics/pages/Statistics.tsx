import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, DatePicker, Spin, Empty, Row, Col } from 'antd'
import ReactECharts from 'echarts-for-react'
import { recordApi } from '../../services'
import dayjs from 'dayjs'

export default function Statistics() {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))

  const { data: statistics, isLoading: statLoading } = useQuery({
    queryKey: ['statistics', month],
    queryFn: () => recordApi.getStatistics(month),
  })

  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ['trend'],
    queryFn: () => recordApi.getTrend(6),
  })

  const isLoading = statLoading || trendLoading

  const getPieOption = () => {
    if (!statistics?.categoryBreakdown) return {}
    return {
      title: {
        text: '支出分类占比',
        left: 'center',
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
        },
      ],
    }
  }

  const getBarOption = () => {
    if (!trend?.list) return {}
    return {
      title: {
        text: '近6个月收支趋势',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['收入', '支出'],
        bottom: 0,
      },
      xAxis: {
        type: 'category',
        data: trend.list.map((item) => item.month),
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '¥{value}',
        },
      },
      series: [
        {
          name: '收入',
          type: 'bar',
          data: trend.list.map((item) => item.income),
          itemStyle: { color: '#52c41a' },
        },
        {
          name: '支出',
          type: 'bar',
          data: trend.list.map((item) => item.expense),
          itemStyle: { color: '#ff4d4f' },
        },
      ],
    }
  }

  const getLineOption = () => {
    if (!trend?.list) return {}
    return {
      title: {
        text: '收支趋势折线图',
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['收入', '支出', '结余'],
        bottom: 0,
      },
      xAxis: {
        type: 'category',
        data: trend.list.map((item) => item.month),
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '¥{value}',
        },
      },
      series: [
        {
          name: '收入',
          type: 'line',
          data: trend.list.map((item) => item.income),
          smooth: true,
          itemStyle: { color: '#52c41a' },
        },
        {
          name: '支出',
          type: 'line',
          data: trend.list.map((item) => item.expense),
          smooth: true,
          itemStyle: { color: '#ff4d4f' },
        },
        {
          name: '结余',
          type: 'line',
          data: trend.list.map((item) => item.balance),
          smooth: true,
          itemStyle: { color: '#1890ff' },
        },
      ],
    }
  }

  return (
    <Spin spinning={isLoading}>
      <Card
        title="数据统计"
        extra={
          <DatePicker
            picker="month"
            value={dayjs(month)}
            onChange={(date) => setMonth(date?.format('YYYY-MM') || dayjs().format('YYYY-MM'))}
          />
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card type="inner" title={`${month} 月收支概览`}>
              <Row gutter={16}>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-gray-500">收入</div>
                    <div className="text-2xl font-bold text-green-500">
                      ¥{statistics?.totalIncome?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-gray-500">支出</div>
                    <div className="text-2xl font-bold text-red-500">
                      ¥{statistics?.totalExpense?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-gray-500">结余</div>
                    <div className="text-2xl font-bold text-blue-500">
                      ¥{statistics?.balance?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner">
              {statistics?.categoryBreakdown?.length > 0 ? (
                <ReactECharts option={getPieOption()} style={{ height: 300 }} />
              ) : (
                <Empty description="暂无数据" />
              )}
            </Card>
          </Col>
          <Col span={12}>
            <Card type="inner">
              {trend?.list?.length > 0 ? (
                <ReactECharts option={getBarOption()} style={{ height: 300 }} />
              ) : (
                <Empty description="暂无数据" />
              )}
            </Card>
          </Col>
          <Col span={24}>
            <Card type="inner">
              {trend?.list?.length > 0 ? (
                <ReactECharts option={getLineOption()} style={{ height: 300 }} />
              ) : (
                <Empty description="暂无数据" />
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    </Spin>
  )
}