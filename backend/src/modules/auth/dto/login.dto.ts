import { IsString, MinLength, MaxLength } from 'class-validator'

export class LoginDto {
  @IsString()
  @MinLength(3, { message: '用户名至少3个字符' })
  @MaxLength(50, { message: '用户名最多50个字符' })
  username!: string

  @IsString()
  @MinLength(1, { message: '密码不能为空' })
  password!: string
}