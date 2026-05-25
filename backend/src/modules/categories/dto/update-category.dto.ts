import {
  IsString,
  IsIn,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  IsNumber,
  Min,
  Max,
} from 'class-validator'

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: '分类名称不能为空' })
  @MaxLength(20, { message: '分类名称最多20个字符' })
  name?: string

  @IsOptional()
  @IsString()
  @IsIn(['income', 'expense'], { message: '类型必须是income或expense' })
  type?: string

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '图标名称最多50个字符' })
  icon?: string

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$|^[\w-]+$/, {
    message: '颜色格式不正确',
  })
  color?: string

  @IsOptional()
  @IsNumber({}, { message: '排序必须是数字' })
  @Min(0, { message: '排序最小为0' })
  @Max(999, { message: '排序最大为999' })
  sortOrder?: number
}