import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // 全局异常过滤器
  app.useGlobalFilters(new GlobalExceptionFilter())

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )

  // CORS配置
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:80'],
    credentials: true,
  })

  // API前缀
  app.setGlobalPrefix('api/v1')

  const port = process.env.PORT || 3000
  await app.listen(port)
  console.log(`Application is running on: http://localhost:${port}`)
}
bootstrap()