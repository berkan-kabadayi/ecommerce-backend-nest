import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1. Durum kodunu belirliyoruz
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 2. Hatadan gelen mesajı 'any' veya gereksiz assertion kullanmadan ayıklıyoruz
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      const resContent = exception.getResponse();

      // resContent'i en başta geniş bir obje formatına cast ediyoruz, böylece ESLint 'unnecessary' uyarısı vermiyor
      if (typeof resContent === 'object' && resContent !== null) {
        const errorBody = resContent as Record<string, unknown>;

        // 'message' alanının varlığını güvenle kontrol edip işlem yapıyoruz
        if ('message' in errorBody) {
          message = Array.isArray(errorBody.message)
            ? errorBody.message.join(', ') // class-validator dizilerini birleştir
            : String(errorBody.message);
        } else {
          message = exception.message;
        }
      } else {
        message =
          typeof resContent === 'string' ? resContent : exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 3. SBK Studio standartlarında pırıl pırıl, ortak hata çıktısı:
    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
