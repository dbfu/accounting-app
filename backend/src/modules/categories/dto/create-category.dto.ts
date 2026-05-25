export class CreateCategoryDto {
  name!: string
  type!: string // 'income' or 'expense'
  icon?: string
  color?: string
  sortOrder?: number
}