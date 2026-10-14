// Client for twh_backend. The access token lives only in memory; the refresh
// token is an httpOnly cookie set by the API, so a page reload calls
// /auth/refresh to get a fresh access token.

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1').replace(/\/+$/, '');

let accessToken: string | null = null;
let refreshing: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

/** Gets a new access token from the refresh cookie. Concurrent callers share one request. */
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshing) {
    refreshing = fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) return null;
        const json = await res.json();
        return (json?.data?.accessToken as string) ?? null;
      })
      .catch(() => null)
      .then((token) => {
        accessToken = token;
        return token;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

type Query = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Query;
}

function buildUrl(path: string, query?: Query) {
  const url = new URL(`${API_URL}${path}`);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }
  return url.toString();
}

async function send(path: string, { method = 'GET', body, query }: RequestOptions) {
  return fetch(buildUrl(path, query), {
    method,
    credentials: 'include',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/** Calls the API and returns `data` from the `{ success, data, message }` envelope. */
export async function api<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  let res: Response;
  try {
    res = await send(path, options);
    // Expired access token: refresh once and retry.
    if (res.status === 401 && !path.startsWith('/auth/')) {
      const token = await refreshAccessToken();
      if (token) res = await send(path, options);
    }
  } catch {
    throw new ApiRequestError(0, 'Cannot reach the server. Is the API running?');
  }

  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) {
    const fieldErrors: Record<string, string> = {};
    if (json?.data && typeof json.data === 'object') {
      for (const [k, v] of Object.entries(json.data as Record<string, unknown>)) {
        if (Array.isArray(v) && v.length) fieldErrors[k] = String(v[0]);
      }
    }
    throw new ApiRequestError(res.status, json?.message ?? `Request failed (${res.status})`, fieldErrors);
  }
  return json?.data as T;
}

/** Multipart upload (e.g. media library). Same auth + refresh handling as api(). */
export async function apiUpload<T = unknown>(path: string, form: FormData, method: 'POST' | 'PUT' = 'POST'): Promise<T> {
  const send = () =>
    fetch(`${API_URL}${path}`, {
      method,
      credentials: 'include',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: form,
    });
  let res: Response;
  try {
    res = await send();
    if (res.status === 401 && (await refreshAccessToken())) res = await send();
  } catch {
    throw new ApiRequestError(0, 'Cannot reach the server. Is the API running?');
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) throw new ApiRequestError(res.status, json?.message ?? `Upload failed (${res.status})`);
  return json?.data as T;
}

export interface Paginated<T> {
  items: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
