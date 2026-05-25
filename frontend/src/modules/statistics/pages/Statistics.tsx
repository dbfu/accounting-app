import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, DatePicker, Spin, Empty, Row, Col, Statistic, Select, Button } from 'antd'
import { PlusCircleOutlined, PayCircleOutlined, WalletOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { recordApi } from '../../../services'
import dayjs from 'dayjs'

export default function Statistics() {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
  const [trendMonths, setTrendMonths] = useState(6)

  // 获取统计数据
  const { data: statistics, isLoading: statLoading } = useQuery({
    queryKey: ['statistics', month],
    queryFn: () => recordApi.getStatistics(month),
  })

  // 获取趋势数据
  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ['trend', trendMonths],
    queryFn: () => recordApi.getTrend(trendMonths),
  })

  const isLoading = statLoading || trendLoading

  // 支出分类饼图配置
  const getPieOption = () => {
    if (!statistics?.categoryBreakdown?.length) return {}
    return {
      title: {
        text: '支出分类占比',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ¥{c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
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
            position: 'outside',
            formatter: '{b}: {d}%',
          },
          labelLine: {
            show: true,
          },
        },
      ],
    }
  }

  // 收支趋势柱状图配置
  const getBarOption = () => {
    if (!trend?.list?.length) return {}
    return {
      title: {
        text: `近${trendMonths}个月收支对比`,
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: ['收入', '支出'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: trend.list.map((item) => item.month),
        axisLabel: {
          formatter: (value: string) => value.replace('-', '年') + '月',
        },
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
          barWidth: '30%',
        },
        {
          name: '支出',
          type: 'bar',
          data: trend.list.map((item) => item.expense),
          itemStyle: { color: '#ff4d4f' },
          barWidth: '30%',
        },
      ],
    }
  }

  // 结余趋势折线图配置
  const getLineOption = () => {
    if (!trend?.list?.length) return {}
    return {
      title: {
        text: '收支结余趋势',
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['收入', '支出', '结余'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: trend.list.map((item) => item.month),
        axisLabel: {
          formatter: (value: string) => value.replace('-', '年') + '月',
        },
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
          areaStyle: { color: 'rgba(82, 196, 26, 0.1)' },
        },
        {
          name: '支出',
          type: 'line',
          data: trend.list.map((item) => item.expense),
          smooth: true,
          itemStyle: { color: '#ff4d4f' },
          areaStyle: { color: 'rgba(255, 77, 79, 0.1)' },
        },
        {
          name: '结余',
          type: 'line',
          data: trend.list.map((item) => item.balance),
          smooth: true,
          itemStyle: { color: '#1890ff' },
          areaStyle: { color: 'rgba(24, 144, 255, 0.1)' },
        },
      ],
    }
  }

  return (
    <Spin spinning={isLoading}>
      <Card
        title="数据统计"
        extra={
          <div className="flex gap-4 items-center">
            <Select
              value={trendMonths}
              onChange={setTrendMonths}
              options={[
                { label: '近3个月', value: 3 },
                { label: '近6个月', value: 6 },
                { label: '近12个月', value: 12 },
              ]}
              className="w-28"
            />
            <DatePicker
              picker="month"
              value={dayjs(month)}
              onChange={(date) => setMonth(date?.format('YYYY-MM') || dayjs().format('YYYY-MM'))}
              allowClear={false}
            />
          </div>
        }
      >
        {/* 月度概览 */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card type="inner" className="shadow-sm">
              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Statistic
                    title={`${month} 月收入`}
                    value={statistics?.totalIncome || 0}
                    precision={2}
                    prefix={<PlusCircleOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title={`${month} 月支出`}
                    value={statistics?.totalExpense || 0}
                    precision={2}
                    prefix={<PayCircleOutlined style={{ color: '#ff4d4f' }} />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic
                    title={`${month} 月结余`}
                    value={statistics?.balance || 0}
                    precision={2}
                    prefix={<WalletOutlined />}
                    valueStyle={{ color: statistics?.balance >= 0 ? '#1890ff' : '#ff4d4f' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* 支出分类饼图 */}
          <Col xs={24} lg={12}>
            <Card type="inner">
              {statistics?.categoryBreakdown?.length > 0 ? (
                <ReactECharts option={getPieOption()} style={{ height: 350 }} />
              ) : (
                <Empty description="本月暂无支出数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </Col>

          {/* 分类明细 */}
          <Col xs={24} lg={12}>
            <Card type="inner" title="支出分类明细">
              {statistics?.categoryBreakdown?.length > 0 ? (
                <div className="space-y-3">
                  {statistics.categoryBreakdown.map((item) => (
                    <div key={item.categoryId} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.categoryName}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-500">¥{item.amount.toFixed(2)}</span>
                        <span className="text-xs text-gray-400">{item.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </Col>

          {/* 收支对比柱状图 */}
          <Col span={24}>
            <Card type="inner">
              {trend?.list?.length > 0 ? (
                <ReactECharts option={getBarOption()} style={{ height: 350 }} />
              ) : (
                <Empty description="暂无趋势数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </Col>

          {/* 结余趋势折线图 */}
          <Col span={24}>
            <Card type="inner">
              {trend?.list?.length > 0 ? (
                <ReactECharts option={getLineOption()} style={{ height: 350 }} />
              ) : (
                <Empty description="暂无趋势数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </Col>
        </Row>
      </Card>
    </Spin>
  )
}