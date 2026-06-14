import { supabase } from './supabase';

const BASE_URL = 'http://localhost:5000/api';

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  let token = session?.access_token;
  let bypassRole: string | null = null;

  if (!token) {
    const bypassUserStr = localStorage.getItem('scholarhub_bypass_user');
    if (bypassUserStr) {
      try {
        const bypassUser = JSON.parse(bypassUserStr);
        token = 'mock-bypass-token';
        bypassRole = bypassUser.role;
      } catch (e) {
        // ignore
      }
    }
  }

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (bypassRole) {
    headers.set('x-bypass-role', bypassRole);
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
