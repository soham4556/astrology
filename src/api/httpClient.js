import { supabase } from '../services/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function apiRequest(path, { method = 'POST', body } = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = payload.message || payload.error || 'Request failed';
    const requestError = new Error(errorMessage);
    requestError.status = response.status;
    requestError.payload = payload;
    throw requestError;
  }

  return payload;
}
