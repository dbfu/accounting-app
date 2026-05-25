import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common'
import { RecordsService } from './records.service'
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard'
import { CreateRecordDto, UpdateRecordDto, QueryRecordDto } from './dto'

@Controller('records')
@UseGuards(JwtAuthGuard)
export class RecordsController {
  constructor(private recordsService: RecordsService) {}

  @Get()
  async findAll(@Request() req: { user: { id: string } }, @Query() query: QueryRecordDto) {
    const result = await this.recordsService.findAll(req.user.id, query)
    return { code: 0, message: 'success', data: result }
  }

  @Get('statistics')
  async getStatistics(@Request() req: { user: { id: string } }, @Query('month') month: string) {
    const result = await this.recordsService.getStatistics(req.user.id, month)
    return { code: 0, message: 'success', data: result }
  }

  @Get('trend')
  async getTrend(@Request() req: { user: { id: string } }, @Query('months') months?: number) {
    const result = await this.recordsService.getTrend(req.user.id, months || 6)
    return { code: 0, message: 'success', data: result }
  }

  @Get(':id')
  async findOne(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    const result = await this.recordsService.findOne(req.user.id, id)
    return { code: 0, message: 'success', data: result }
  }

  @Post()
  async create(@Request() req: { user: { id: string } }, @Body() dto: CreateRecordDto) {
    const result = await this.recordsService.create(req.user.id, dto)
    return { code: 0, message: '创建成功', data: result }
  }

  @Put(':id')
  async update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateRecordDto,
  ) {
    const result = await this.recordsService.update(req.user.id, id, dto)
    return { code: 0, message: '更新成功', data: result }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Request() req: { user: { id: string } }, @Param('id') id: string) {
    await this.recordsService.remove(req.user.id, id)
    return { code: 0, message: '删除成功', data: null }
  }
}