import { IsString, IsEmail, MinLength, MaxLength, Matches, IsOptional, IsUrl } from 'class-validator'

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: '用户名至少3个字符' })
  @MaxLength(20, { message: '用户名最多20个字符' })
  @Matches(/^[\w一-龥]+$/, { message: '用户名只能包含字母、数字、下划线或中文' })
  username?: string

  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: '头像必须是有效的URL地址' })
  avatar?: string
}