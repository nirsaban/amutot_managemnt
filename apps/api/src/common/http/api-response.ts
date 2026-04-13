export type ApiOkResponse<TData> = {
  success: true;
  data: TData;
  meta?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
    path: string;
  };
};

export type ApiResponse<TData> = ApiOkResponse<TData> | ApiErrorResponse;

export function ok<TData>(data: TData, meta?: Record<string, unknown>): ApiOkResponse<TData> {
  return {
    success: true,
    data,
    ...(meta ? { meta } : {})
  };
}

