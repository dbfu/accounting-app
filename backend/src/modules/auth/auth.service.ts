import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto } from './dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 检查用户名是否已存在
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: dto.username }, { email: dto.email }],
      },
    })

    if (existingUser) {
      if (existingUser.username === dto.username) {
        throw new Error('用户名已存在')
      }
      throw new Error('邮箱已被注册')
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(dto.password, 10)

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashedPassword,
      },
    })

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    }
  }

  async login(dto: LoginDto) {
    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(dto.password, user.password)
    if (!isPasswordValid) {
      throw new Error('密码错误')
    }

    // 生成JWT Token
    const payload = { sub: user.id, username: user.username }
    const accessToken = this.jwtService.sign(payload)

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // 检查用户名/邮箱是否被其他用户占用
    if (dto.username || dto.email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { username: dto.username },
            { email: dto.email },
          ],
          NOT: { id: userId },
        },
      })

      if (existingUser) {
        if (existingUser.username === dto.username) {
          throw new Error('用户名已存在')
        }
        throw new Error('邮箱已被使用')
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    })

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(dto.oldPassword, user.password)
    if (!isPasswordValid) {
      throw new Error('原密码错误')
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10)
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })
  }
}