import {
  IsString,
  IsNumber,
  IsPositive,
  Max,
  IsDateString,
  IsUUID,
  IsIn,
  IsOptional,
  MaxLength,
} from 'class-validator'

export class CreateRecordDto {
  @IsString()
  @IsIn(['income', 'expense'], { message: '类型必须是income或expense' })
  type!: string

  @IsNumber({}, { message: '金额必须是数字' })
  @IsPositive({ message: '金额必须大于0' })
  @Max(999999999999.99, { message: '金额不能超过999999999999.99' })
  amount!: number

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '备注最多255个字符' })
  description?: string

  @IsDateString({}, { message: '日期格式不正确，应为YYYY-MM-DD格式' })
  recordDate!: string

  @IsUUID('4', { message: '分类ID格式不正确' })
  categoryId!: string
}