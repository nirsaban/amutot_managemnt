import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from "@nestjs/common";
import { map } from "rxjs/operators";

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data: unknown) => {
        if (data && typeof data === "object" && "success" in (data as Record<string, unknown>)) {
          return data;
        }
        return { success: true, data };
      })
    );
  }
}

