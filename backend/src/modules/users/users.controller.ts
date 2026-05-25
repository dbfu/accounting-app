import { Controller, Get, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'
import { PrismaService } from '../../prisma/prisma.service'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  async getCurrentUser(@Request() req: { user: { id: string } }) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    }
  }
}