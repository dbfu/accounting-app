export class CreateRecordDto {
  type!: string // 'income' or 'expense'
  amount!: number
  description?: string
  recordDate!: string
  categoryId!: string
}