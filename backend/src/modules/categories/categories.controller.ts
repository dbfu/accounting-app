import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'
import { CreateCategoryDto, UpdateCategoryDto } from './dto'

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Request() req: { user: { id: string } }) {
    const result = await this.categoriesService.findAll(req.user.id)
    return { code: 0, message: 'success', data: result }
  }

  @Get(':id')
  async findOne(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    const result = await this.categoriesService.findOne(req.user.id, id)
    return { code: 0, message: 'success', data: result }
  }

  @Post()
  async create(@Request() req: { user: { id: string } }, @Body() dto: CreateCategoryDto) {
    const result = await this.categoriesService.create(req.user.id, dto)
    return { code: 0, message: '创建成功', data: result }
  }

  @Put(':id')
  async update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const result = await this.categoriesService.update(req.user.id, id, dto)
    return { code: 0, message: '更新成功', data: result }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    await this.categoriesService.remove(req.user.id, id)
    return { code: 0, message: '删除成功', data: null }
  }
}