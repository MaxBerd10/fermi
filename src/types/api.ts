export interface ApiMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiErrorBody;

export class ApiError extends Error {
  code: string;
  status: number;
  fields?: Record<string, string[]>;

  constructor(message: string, code: string, status: number, fields?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}
