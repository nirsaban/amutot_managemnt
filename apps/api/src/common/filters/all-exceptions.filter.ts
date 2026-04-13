import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus
} from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    const request = ctx.getRequest<any>();

    const timestamp = new Date().toISOString();
    const path = request.url ?? "";

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const resBody = exception.getResponse();

      let message = exception.message;
      if (typeof resBody === "string") {
        message = resBody;
      } else if (typeof resBody === "object" && resBody && "message" in resBody) {
        const maybeMessage = (resBody as { message?: unknown }).message;
        message = Array.isArray(maybeMessage) ? maybeMessage.map(String).join(", ") : String(maybeMessage);
      }

      const code =
        typeof resBody === "object" && resBody && "code" in resBody
          ? String((resBody as { code?: unknown }).code)
          : "HTTP_EXCEPTION";

      const details =
        typeof resBody === "object" && resBody
          ? (resBody as Record<string, unknown>)
          : undefined;

      response.status(statusCode).json({
        success: false,
        error: {
          statusCode,
          code,
          message,
          details,
          timestamp,
          path
        }
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error",
        details: exception instanceof Error ? { name: exception.name, message: exception.message } : exception,
        timestamp,
        path
      }
    });
  }
}
