import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'

interface ErrorResponse {
  code: number
  message: string
  data: null
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = '服务器内部错误'
    let code = 50000

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, unknown>
        message = (responseObj.message as string) || exception.message
        if (Array.isArray(responseObj.message)) {
          message = (responseObj.message as string[]).join(', ')
        }
      }

      // 根据HTTP状态码设置业务错误码
      if (status === HttpStatus.BAD_REQUEST) {
        code = 40000
      } else if (status === HttpStatus.UNAUTHORIZED) {
        code = 40100
        message = '未登录或登录已过期'
      } else if (status === HttpStatus.FORBIDDEN) {
        code = 40300
        message = '无权限访问'
      } else if (status === HttpStatus.NOT_FOUND) {
        code = 40400
        message = '资源不存在'
      }
    } else if (exception instanceof Error) {
      message = exception.message

      // 业务错误消息转换为对应的状态码
      if (
        message.includes('已存在') ||
        message.includes('已被') ||
        message.includes('格式')
      ) {
        status = HttpStatus.BAD_REQUEST
        code = 40000
      } else if (message.includes('不存在') || message.includes('未找到')) {
        status = HttpStatus.NOT_FOUND
        code = 40400
      } else if (
        message.includes('无权限') ||
        message.includes('权限') ||
        message.includes('错误')
      ) {
        status = HttpStatus.BAD_REQUEST
        code = 40000
      }
    }

    const errorResponse: ErrorResponse = {
      code,
      message,
      data: null,
    }

    response.status(status).json(errorResponse)
  }
}