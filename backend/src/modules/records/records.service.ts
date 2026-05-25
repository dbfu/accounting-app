import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateRecordDto, UpdateRecordDto, QueryRecordDto } from './dto'
import dayjs from 'dayjs'

@Injectable()
export class RecordsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateRecordDto) {
    const record = await this.prisma.record.create({
      data: {
        type: dto.type,
        amount: dto.amount,
        description: dto.description,
        recordDate: new Date(dto.recordDate),
        userId,
        categoryId: dto.categoryId,
      },
      include: {
        category: true,
      },
    })

    return {
      ...record,
      amount: Number(record.amount),
    }
  }

  async findAll(userId: string, query: QueryRecordDto) {
    const page = query.page || 1
    const pageSize = query.pageSize || 20
    const skip = (page - 1) * pageSize

    // 构建查询条件
    const where: Record<string, unknown> = { userId }

    if (query.month) {
      const startOfMonth = dayjs(query.month).startOf('month').toDate()
      const endOfMonth = dayjs(query.month).endOf('month').toDate()
      where.recordDate = {
        gte: startOfMonth,
        lte: endOfMonth,
      }
    }

    if (query.type) {
      where.type = query.type
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId
    }

    if (query.keyword) {
      where.description = {
        contains: query.keyword,
      }
    }

    const records = await this.prisma.record.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        recordDate: 'desc',
      },
      skip,
      take: pageSize,
    })

    const total = await this.prisma.record.count({ where })

    // 计算汇总数据
    const summary = await this.getSummary(userId, query.month)

    return {
      list: records.map((r) => ({
        ...r,
        amount: Number(r.amount),
      })),
      total,
      page,
      pageSize,
      summary,
    }
  }

  async findOne(userId: string, id: string) {
    const record = await this.prisma.record.findFirst({
      where: { id, userId },
      include: {
        category: true,
      },
    })

    if (!record) {
      throw new Error('记录不存在')
    }

    return {
      ...record,
      amount: Number(record.amount),
    }
  }

  async update(userId: string, id: string, dto: UpdateRecordDto) {
    const record = await this.prisma.record.findFirst({
      where: { id, userId },
    })

    if (!record) {
      throw new Error('记录不存在')
    }

    const updated = await this.prisma.record.update({
      where: { id },
      data: {
        type: dto.type,
        amount: dto.amount,
        description: dto.description,
        recordDate: dto.recordDate ? new Date(dto.recordDate) : undefined,
        categoryId: dto.categoryId,
      },
      include: {
        category: true,
      },
    })

    return {
      ...updated,
      amount: Number(updated.amount),
    }
  }

  async remove(userId: string, id: string) {
    const record = await this.prisma.record.findFirst({
      where: { id, userId },
    })

    if (!record) {
      throw new Error('记录不存在')
    }

    await this.prisma.record.delete({ where: { id } })
  }

  async getSummary(userId: string, month?: string) {
    const where: Record<string, unknown> = { userId }

    if (month) {
      const startOfMonth = dayjs(month).startOf('month').toDate()
      const endOfMonth = dayjs(month).endOf('month').toDate()
      where.recordDate = {
        gte: startOfMonth,
        lte: endOfMonth,
      }
    }

    const incomeRecords = await this.prisma.record.aggregate({
      where: { ...where, type: 'income' },
      _sum: { amount: true },
    })

    const expenseRecords = await this.prisma.record.aggregate({
      where: { ...where, type: 'expense' },
      _sum: { amount: true },
    })

    const totalIncome = Number(incomeRecords._sum.amount || 0)
    const totalExpense = Number(expenseRecords._sum.amount || 0)
    const balance = totalIncome - totalExpense

    return {
      totalIncome,
      totalExpense,
      balance,
    }
  }

  async getStatistics(userId: string, month: string) {
    const startOfMonth = dayjs(month).startOf('month').toDate()
    const endOfMonth = dayjs(month).endOf('month').toDate()

    // 获取支出分类统计
    const expenseByCategory = await this.prisma.record.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'expense',
        recordDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    })

    // 获取分类信息
    const categories = await this.prisma.category.findMany({
      where: {
        id: {
          in: expenseByCategory.map((e) => e.categoryId),
        },
      },
    })

    const totalExpense = expenseByCategory.reduce(
      (sum, e) => sum + Number(e._sum.amount || 0),
      0,
    )

    const categoryBreakdown = expenseByCategory
      .map((e) => {
        const category = categories.find((c) => c.id === e.categoryId)
        const amount = Number(e._sum.amount || 0)
        return {
          categoryId: e.categoryId,
          categoryName: category?.name || '未知',
          amount,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
          color: category?.color || '#BDC3C7',
        }
      })
      .sort((a, b) => b.amount - a.amount)

    const summary = await this.getSummary(userId, month)

    return {
      month,
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      balance: summary.balance,
      categoryBreakdown,
    }
  }

  async getTrend(userId: string, months: number = 6) {
    const result = []
    const now = dayjs()

    for (let i = months - 1; i >= 0; i--) {
      const month = now.subtract(i, 'month').format('YYYY-MM')
      const startOfMonth = dayjs(month).startOf('month').toDate()
      const endOfMonth = dayjs(month).endOf('month').toDate()

      const incomeRecords = await this.prisma.record.aggregate({
        where: {
          userId,
          type: 'income',
          recordDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: { amount: true },
      })

      const expenseRecords = await this.prisma.record.aggregate({
        where: {
          userId,
          type: 'expense',
          recordDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: { amount: true },
      })

      const income = Number(incomeRecords._sum.amount || 0)
      const expense = Number(expenseRecords._sum.amount || 0)

      result.push({
        month,
        income,
        expense,
        balance: income - expense,
      })
    }

    return { list: result }
  }
}