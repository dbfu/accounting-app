import { Module } from '@nestjs/common'
import { BudgetController } from './budget.controller'
import { BudgetService } from './budget.service'
import { RecordsModule } from '../records/records.module'

@Module({
  imports: [RecordsModule],
  controllers: [BudgetController],
  providers: [BudgetService],
  exports: [BudgetService],
})
export class BudgetModule {}