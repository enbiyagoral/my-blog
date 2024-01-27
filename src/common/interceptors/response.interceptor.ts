import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { ApiResponse } from './api-response.interface'

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse()
        const statusCode = response.statusCode

        if (statusCode >= 200 && statusCode < 300) {
          // Başarılı durumlar
          return {
            statusCode,
            message: 'Success',
            data,
          }
        } else if (statusCode >= 400 && statusCode < 500) {
          // İstemci hatası durumları
          return {
            statusCode,
            message: 'Client Error',
            data,
          }
        } else if (statusCode >= 500) {
          // Sunucu hatası durumları
          return {
            statusCode,
            message: 'Server Error',
            data,
          }
        } else {
          // Bilinmeyen durumlar için genel mesaj
          return {
            statusCode,
            message: 'Unhandled Status',
            data,
          }
        }
      }),
      catchError((error) => {
        const statusCode = error.status || 500
        return throwError(() => ({
          statusCode,
          message: error.message || 'Internal Server Error',
        }))
      }),
    )
  }
}
