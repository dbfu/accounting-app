import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, InputNumber, Button, Progress, DatePicker, Spin, message, Empty, Alert } from 'antd'
import { budgetApi, recordApi } from '../../services'
import dayjs from 'dayjs'

export default function Budget() {
  const [amount, setAmount] = useState<number | null>(null)
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
  const queryClient = useQueryClient()

  const { data: budgetProgress, isLoading } = useQuery({
    queryKey: ['budget', 'current'],
    queryFn: () => budgetApi.getCurrent(),
  })

  const { data: statistics } = useQuery({
    queryKey: ['statistics', month],
    queryFn: () => recordApi.getStatistics(month),
  })

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

  const handleSetBudget = () => {
    if (!amount || amount <= 0) {
      message.warning('请输入有效的预算金额')
      return
    }
    createMutation.mutate({ amount, month })
  }

  return (
    <Spin spinning={isLoading}>
      <Card title="预算管理">
        {budgetProgress?.isOverBudget && (
          <Alert
            type="error"
            message="超支警告"
            description={`本月已超支 ¥${(budgetProgress.spent - budgetProgress.budget.amount).toFixed(2)}`}
            className="mb-4"
          />
        )}

        <div className="mb-6">
          <div className="flex gap-4 items-end">
            <div>
              <div className="text-gray-500 mb-2">设置月份</div>
              <DatePicker
                picker="month"
                value={dayjs(month)}
                onChange={(date) => setMonth(date?.format('YYYY-MM') || dayjs().format('YYYY-MM'))}
              />
            </div>
            <div>
              <div className="text-gray-500 mb-2">预算金额</div>
              <InputNumber
                min={0}
                precision={2}
                prefix="¥"
                value={amount}
                onChange={setAmount}
                className="w-32"
              />
            </div>
            <Button
              type="primary"
              onClick={handleSetBudget}
              loading={createMutation.isPending}
            >
              设置预算
            </Button>
          </div>
        </div>

        {budgetProgress ? (
          <div>
            <div className="mb-4">
              <div className="text-gray-500">
                {budgetProgress.budget.month} 月预算进度
              </div>
              <div className="mt-2">
                <Progress
                  percent={budgetProgress.percentage}
                  status={budgetProgress.isOverBudget ? 'exception' : 'active'}
                  strokeColor={
                    budgetProgress.isOverBudget
                      ? '#ff4d4f'
                      : budgetProgress.percentage > 80
                      ? '#faad14'
                      : '#52c41a'
                  }
                />
              </div>
              <div className="flex justify-between mt-2 text-gray-500">
                <span>已花费 ¥{budgetProgress.spent.toFixed(2)}</span>
                <span>预算 ¥{budgetProgress.budget.amount.toFixed(2)}</span>
                <span>
                  {budgetProgress.isOverBudget ? '超支' : '剩余'}
                  ¥{Math.abs(budgetProgress.remaining).toFixed(2)}
                </span>
              </div>
            </div>

            <Card type="inner" title="本月支出详情">
              {statistics?.totalExpense ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span>总支出</span>
                    <span className="text-lg font-bold text-red-500">
                      ¥{statistics.totalExpense.toFixed(2)}
                    </span>
                  </div>
                  {statistics.categoryBreakdown?.length > 0 && (
                    <div className="space-y-2">
                      {statistics.categoryBreakdown.map((item) => (
                        <div key={item.categoryId} className="flex justify-between items-center">
                          <span>{item.categoryName}</span>
                          <span className="text-gray-500">
                            ¥{item.amount.toFixed(2)} ({item.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Empty description="本月暂无支出记录" />
              )}
            </Card>
          </div>
        ) : (
          <Empty description="暂未设置预算，请先设置本月预算" />
        )}
      </Card>
    </Spin>
  )
}