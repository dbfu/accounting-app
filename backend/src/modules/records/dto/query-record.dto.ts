import {
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsString,
  IsIn,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator'
import { Type } from 'class-transformer'

export class QueryRecordDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页码必须是数字' })
  @Min(1, { message: '页码最小为1' })
  @Max(1000, { message: '页码最大为1000' })
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '每页数量必须是数字' })
  @Min(1, { message: '每页数量最小为1' })
  @Max(100, { message: '每页数量最大为100' })
  pageSize?: number

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: '月份格式不正确，应为YYYY-MM格式' })
  month?: string

  @IsOptional()
  @IsString()
  @IsIn(['income', 'expense'], { message: '类型必须是income或expense' })
  type?: string

  @IsOptional()
  @IsUUID('4', { message: '分类ID格式不正确' })
  categoryId?: string

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '搜索关键词最多100个字符' })
  keyword?: string
}