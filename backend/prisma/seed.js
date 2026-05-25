const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const defaultCategories = [
  // 支出分类
  { name: '餐饮', type: 'expense', icon: 'food', color: '#FF6B6B', sortOrder: 1 },
  { name: '交通', type: 'expense', icon: 'car', color: '#4ECDC4', sortOrder: 2 },
  { name: '购物', type: 'expense', icon: 'shopping', color: '#45B7D1', sortOrder: 3 },
  { name: '娱乐', type: 'expense', icon: 'game', color: '#96CEB4', sortOrder: 4 },
  { name: '医疗', type: 'expense', icon: 'medical', color: '#FFEAA7', sortOrder: 5 },
  { name: '教育', type: 'expense', icon: 'education', color: '#DDA0DD', sortOrder: 6 },
  { name: '住房', type: 'expense', icon: 'home', color: '#87CEEB', sortOrder: 7 },
  { name: '通讯', type: 'expense', icon: 'phone', color: '#F0E68C', sortOrder: 8 },
  { name: '其他支出', type: 'expense', icon: 'other', color: '#BDC3C7', sortOrder: 99 },

  // 收入分类
  { name: '工资', type: 'income', icon: 'salary', color: '#22C55E', sortOrder: 1 },
  { name: '奖金', type: 'income', icon: 'bonus', color: '#16A34A', sortOrder: 2 },
  { name: '投资收益', type: 'income', icon: 'invest', color: '#15803D', sortOrder: 3 },
  { name: '兼职', type: 'income', icon: 'parttime', color: '#166534', sortOrder: 4 },
  { name: '红包', type: 'income', icon: 'gift', color: '#14532D', sortOrder: 5 },
  { name: '其他收入', type: 'income', icon: 'other', color: '#134E4A', sortOrder: 99 },
]

async function main() {
  console.log('开始初始化默认分类...')

  // 检查是否已存在默认分类
  const existingCount = await prisma.category.count({
    where: { userId: null },
  })

  if (existingCount > 0) {
    console.log(`已存在${existingCount}个默认分类，跳过初始化`)
    return
  }

  // 创建默认分类
  for (const category of defaultCategories) {
    await prisma.category.create({
      data: {
        ...category,
        userId: null, // 系统默认分类
      },
    })
  }

  console.log(`成功创建${defaultCategories.length}个默认分类`)
}

main()
  .catch((e) => {
    console.error('初始化默认分类失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })