import { IsString, MinLength, MaxLength, Matches } from 'class-validator'

export class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: '原密码不能为空' })
  oldPassword!: string

  @IsString()
  @MinLength(6, { message: '新密码至少6个字符' })
  @MaxLength(50, { message: '新密码最多50个字符' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/, {
    message: '新密码必须包含字母和数字',
  })
  newPassword!: string
}