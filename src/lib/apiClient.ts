import { supabase } from './supabase';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'API request failed';
    try {
      const errorJson = await response.json();
      errorMsg = errorJson.error || errorMsg;
    } catch (e) {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get<T = any>(path: string, options?: RequestInit) {
    return apiFetch<T>(path, { ...options, method: 'GET' });
  },
  post<T = any>(path: string, body?: any, options?: RequestInit) {
    return apiFetch<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  put<T = any>(path: string, body?: any, options?: RequestInit) {
    return apiFetch<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  delete<T = any>(path: string, options?: RequestInit) {
    return apiFetch<T>(path, { ...options, method: 'DELETE' });
  },
};
