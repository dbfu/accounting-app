import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { RecordsService } from '../records/records.service'
import { CreateBudgetDto } from './dto'
import dayjs from 'dayjs'

@Injectable()
export class BudgetService {
  constructor(
    private prisma: PrismaService,
    private recordsService: RecordsService,
  ) {}

  async findAll(userId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      orderBy: { month: 'desc' },
    })

    return budgets.map((b) => ({
      ...b,
      amount: Number(b.amount),
    }))
  }

  async getCurrent(userId: string) {
    const currentMonth = dayjs().format('YYYY-MM')

    const budget = await this.prisma.budget.findUnique({
      where: {
        userId_month: {
          userId,
          month: currentMonth,
        },
      },
    })

    if (!budget) {
      throw new Error('本月未设置预算')
    }

    const summary = await this.recordsService.getSummary(userId, currentMonth)
    const spent = summary.totalExpense
    const remaining = Number(budget.amount) - spent
    const percentage = Number(budget.amount) > 0 ? (spent / Number(budget.amount)) * 100 : 0
    const isOverBudget = spent > Number(budget.amount)

    return {
      budget: {
        ...budget,
        amount: Number(budget.amount),
      },
      spent,
      remaining,
      percentage,
      isOverBudget,
    }
  }

  async createOrUpdate(userId: string, dto: CreateBudgetDto) {
    // 检查是否已存在该月份预算
    const existing = await this.prisma.budget.findUnique({
      where: {
        userId_month: {
          userId,
          month: dto.month,
        },
      },
    })

    if (existing) {
      const updated = await this.prisma.budget.update({
        where: { id: existing.id },
        data: { amount: dto.amount },
      })
      return {
        ...updated,
        amount: Number(updated.amount),
      }
    }

    const budget = await this.prisma.budget.create({
      data: {
        amount: dto.amount,
        month: dto.month,
        userId,
      },
    })

    return {
      ...budget,
      amount: Number(budget.amount),
    }
  }

  async remove(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
    })

    if (!budget) {
      throw new Error('预算不存在')
    }

    await this.prisma.budget.delete({ where: { id } })
  }
}