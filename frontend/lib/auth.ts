import Cookies from 'js-cookie';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  avatar?: string;
}

export function saveAuth(token: string, user: User) {
  Cookies.set('sd_token', token, { expires: 1, sameSite: 'lax' });
  localStorage.setItem('sd_token', token);
  localStorage.setItem('sd_user', JSON.stringify(user));
}

export function clearAuth() {
  Cookies.remove('sd_token');
  localStorage.removeItem('sd_token');
  localStorage.removeItem('sd_user');
}

export function getToken(): string | null {
  return Cookies.get('sd_token') || localStorage.getItem('sd_token');
}

export function getUser(): User | null {
  try {
    const u = localStorage.getItem('sd_user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function getRedirectPath(role: string): string {
  return role === 'ADMIN' ? '/admin' : '/website';
}
