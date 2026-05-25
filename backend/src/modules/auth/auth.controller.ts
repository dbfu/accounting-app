import { Controller, Post, Get, Put, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './strategies/jwt-auth.guard'
import { RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto } from './dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto)
    return { code: 0, message: '注册成功', data: result }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto)
    return { code: 0, message: '登录成功', data: result }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { code: 0, message: '登出成功', data: null }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: { user: { id: string } }) {
    const result = await this.authService.getProfile(req.user.id)
    return { code: 0, message: 'success', data: result }
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    const result = await this.authService.updateProfile(req.user.id, dto)
    return { code: 0, message: '更新成功', data: result }
  }

  @Put('password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req: { user: { id: string } },
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(req.user.id, dto)
    return { code: 0, message: '密码修改成功', data: null }
  }
}