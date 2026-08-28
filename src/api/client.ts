import i18n from "../i18n";
import type { ApiEnvelope, ApiErrorBody, ApiMeta } from "../types/api";
import { ApiError } from "../types/api";

function isErrorEnvelope<T>(envelope: ApiEnvelope<T>): envelope is ApiErrorBody {
  return envelope.success === false;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const ACCESS_TOKEN_KEY = "fjsti_access_token";
const REFRESH_TOKEN_KEY = "fjsti_refresh_token";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export interface ApiResult<T> {
  data: T;
  meta?: ApiMeta;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  params?: Record<string, string | number | undefined | null>;
  body?: unknown;
  formData?: FormData;
  auth?: boolean;
  /** internal: prevents infinite refresh-retry loops */
  _isRetry?: boolean;
}

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const url = new URL(BASE_URL.replace(/\/$/, "") + "/" + path.replace(/^\//, ""), window.location.origin);
  url.searchParams.set("lang", (i18n.resolvedLanguage || i18n.language || "uz").slice(0, 2));
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const url = buildUrl(path, options.params);
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;

  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body,
  });

  const envelope = (await response.json()) as ApiEnvelope<T>;

  if (isErrorEnvelope(envelope)) {
    if (response.status === 401 && options.auth && !options._isRetry) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        return request<T>(path, { ...options, _isRetry: true });
      }
      clearTokens();
    }
    throw new ApiError(envelope.error.message, envelope.error.code, response.status, envelope.error.fields);
  }

  return { data: envelope.data, meta: envelope.meta };
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await request<{ accessToken: string; refreshToken: string }>("auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
    setTokens(res.data.accessToken, res.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export const apiClient = {
  get: <T>(path: string, params?: RequestOptions["params"], auth = false) =>
    request<T>(path, { method: "GET", params, auth }),
  post: <T>(path: string, body?: unknown, auth = false) =>
    request<T>(path, { method: "POST", body, auth }),
  put: <T>(path: string, body?: unknown, auth = false) =>
    request<T>(path, { method: "PUT", body, auth }),
  del: <T>(path: string, auth = false) =>
    request<T>(path, { method: "DELETE", auth }),
  postForm: <T>(path: string, formData: FormData, auth = false) =>
    request<T>(path, { method: "POST", formData, auth }),
};
