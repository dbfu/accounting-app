import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { RecordsModule } from './modules/records/records.module'
import { CategoriesModule } from './modules/categories/categories.module'
import { BudgetModule } from './modules/budget/budget.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RecordsModule,
    CategoriesModule,
    BudgetModule,
  ],
})
export class AppModule {}