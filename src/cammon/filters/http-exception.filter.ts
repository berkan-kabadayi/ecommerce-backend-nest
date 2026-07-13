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

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      const resContent = exception.getResponse();

      if (typeof resContent === 'object' && resContent !== null) {
        const errorBody = resContent as Record<string, unknown>;

        if ('message' in errorBody) {
          message = Array.isArray(errorBody.message)
            ? errorBody.message.join(', ')
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

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
