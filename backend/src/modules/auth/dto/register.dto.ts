import { IsString, IsEmail, MinLength, MaxLength, Matches } from 'class-validator'

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: '用户名至少3个字符' })
  @MaxLength(20, { message: '用户名最多20个字符' })
  @Matches(/^[\w一-龥]+$/, { message: '用户名只能包含字母、数字、下划线或中文' })
  username!: string

  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string

  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  @MaxLength(50, { message: '密码最多50个字符' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, {
    message: '密码必须包含字母和数字',
  })
  password!: string
}