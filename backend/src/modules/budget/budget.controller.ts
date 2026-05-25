import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common'
import { BudgetService } from './budget.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'
import { CreateBudgetDto } from './dto'

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private budgetService: BudgetService) {}

  @Get()
  async findAll(@Request() req: { user: { id: string } }) {
    const result = await this.budgetService.findAll(req.user.id)
    return { code: 0, message: 'success', data: result }
  }

  @Get('current')
  async getCurrent(@Request() req: { user: { id: string } }) {
    try {
      const result = await this.budgetService.getCurrent(req.user.id)
      return { code: 0, message: 'success', data: result }
    } catch {
      return { code: 0, message: 'success', data: null }
    }
  }

  @Post()
  async create(@Request() req: { user: { id: string } }, @Body() dto: CreateBudgetDto) {
    const result = await this.budgetService.createOrUpdate(req.user.id, dto)
    return { code: 0, message: '设置成功', data: result }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    await this.budgetService.remove(req.user.id, id)
    return { code: 0, message: '删除成功', data: null }
  }
}