import {
  IsNumber,
  IsPositive,
  Max,
  IsString,
  Matches,
} from 'class-validator'

export class CreateBudgetDto {
  @IsNumber({}, { message: '预算金额必须是数字' })
  @IsPositive({ message: '预算金额必须大于0' })
  @Max(999999999999.99, { message: '预算金额不能超过999999999999.99' })
  amount!: number

  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: '月份格式不正确，应为YYYY-MM格式' })
  month!: string
}