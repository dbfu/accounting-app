import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateCategoryDto, UpdateCategoryDto } from './dto'

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    // 获取用户自定义分类 + 系统默认分类（userId为null）
    const categories = await this.prisma.category.findMany({
      where: {
        OR: [{ userId }, { userId: null }],
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })

    return categories
  }

  async findOne(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        OR: [{ userId }, { userId: null }],
      },
    })

    if (!category) {
      throw new Error('分类不存在')
    }

    return category
  }

  async create(userId: string, dto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        type: dto.type,
        icon: dto.icon,
        color: dto.color,
        sortOrder: dto.sortOrder || 0,
        userId,
      },
    })

    return category
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    })

    if (!category) {
      throw new Error('分类不存在或无权限修改')
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: dto,
    })

    return updated
  }

  async remove(userId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    })

    if (!category) {
      throw new Error('分类不存在或无权限删除')
    }

    // 检查是否有记账记录使用此分类
    const recordsCount = await this.prisma.record.count({
      where: { categoryId: id },
    })

    if (recordsCount > 0) {
      throw new Error('此分类下有记账记录，无法删除')
    }

    await this.prisma.category.delete({ where: { id } })
  }
}