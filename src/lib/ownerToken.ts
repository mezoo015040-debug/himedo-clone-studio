import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'application_owner_token';
const HEADER_NAME = 'x-owner-token';

function applyHeader(token: string | null) {
  try {
    const headers: Record<string, string> = (supabase as any).rest?.headers ?? {};
    if (token) {
      headers[HEADER_NAME] = token;
    } else {
      delete headers[HEADER_NAME];
    }
    if ((supabase as any).rest) {
      (supabase as any).rest.headers = headers;
    }
    // Also set on realtime/functions if present – ignore failures.
    if ((supabase as any).realtime?.setAuth) {
      // noop – realtime uses jwt, not custom headers
    }
  } catch {
    // ignore
  }
}

export function getOwnerToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function ensureOwnerToken(): string {
  let token = localStorage.getItem(STORAGE_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, token);
  }
  applyHeader(token);
  return token;
}

export function initOwnerToken(): void {
  const token = localStorage.getItem(STORAGE_KEY);
  if (token) applyHeader(token);
}

export function resetOwnerToken(): void {
  localStorage.removeItem(STORAGE_KEY);
  applyHeader(null);
}