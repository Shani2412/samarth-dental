'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUser, getToken, clearAuth, saveAuth, User } from '@/lib/auth';
import api from '@/lib/api';

export function useAuth(required = true, adminOnly = false) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      if (required) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      setLoading(false);
      return;
    }

    const cached = getUser();
    if (cached && cached.role) {
      if (adminOnly && cached.role !== 'ADMIN') {
        router.replace('/website');
        return;
      }
      setUser(cached);
      setLoading(false);
      return;
    }

    // Token exists but no cached user — verify with backend
    api.get('/auth/me')
      .then(res => {
        const u = res.data.data?.user || res.data.user;
        if (!u) throw new Error('No user returned');
        if (adminOnly && u.role !== 'ADMIN') {
          router.replace('/website');
          return;
        }
        // Save full user with email
        saveAuth(token, u);
        setUser(u);
      })
      .catch(() => {
        clearAuth();
        if (required) router.replace('/login');
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    clearAuth();
    router.push('/login');
  };

  return { user, loading, logout };
}
