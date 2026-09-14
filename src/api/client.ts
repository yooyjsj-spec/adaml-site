import { AuthMeResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

let csrfToken: string | null = null;

export const setCsrfToken = (token?: string | null) => {
  csrfToken = token ?? null;
};

type RequestOptions = RequestInit & {
  skipJson?: boolean;
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  const hasBody = Boolean(options.body);
  if (hasBody && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (csrfToken && !['GET', 'HEAD'].includes((options.method ?? 'GET').toUpperCase())) {
    headers.set('x-csrf-token', csrfToken);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    const message = Array.isArray(error)
      ? error.map((item) => item.message).filter(Boolean).join(', ') || 'API request failed'
      : error.message ?? 'API request failed';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }

  if (options.skipJson || response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
};

export const refreshAuth = async () => {
  const auth = await apiRequest<AuthMeResponse>('/api/auth/me');
  setCsrfToken(auth.csrfToken);
  return auth;
};

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;
