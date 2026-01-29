/**
 * BESTO Design Cloud API HTTP 클라이언트.
 * baseURL = REACT_APP_API_URL || http://localhost:8000, 타임아웃 30초.
 */
const DEFAULT_TIMEOUT_MS = 30_000;
const baseURL =
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) ||
  'http://localhost:8000';

function resolveUrl(path: string): string {
  const base = baseURL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown> | string;
  timeoutMs?: number;
}

/**
 * API 요청 래퍼. JSON body/response, 타임아웃, Content-Type 처리.
 */
export async function request<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, timeoutMs = DEFAULT_TIMEOUT_MS, headers: optHeaders, ...rest } = options;
  const url = resolveUrl(path);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...optHeaders,
  };
  const init: RequestInit = {
    ...rest,
    headers,
  };
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    clearTimeout(timeoutId);
    const text = await response.text();
    if (!response.ok) {
      let detail: string;
      try {
        const json = JSON.parse(text);
        detail = json.detail ?? text;
      } catch {
        detail = text || response.statusText;
      }
      const err = new Error(detail) as Error & { status?: number; detail?: unknown };
      err.status = response.status;
      err.detail = response.status >= 500 ? '서버 오류가 발생했습니다.' : detail;
      throw err;
    }
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error) {
      if (e.name === 'AbortError') {
        const err = new Error('요청 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.') as Error & { status?: number };
        err.status = 408;
        throw err;
      }
      throw e;
    }
    throw e;
  }
}

export { baseURL };
