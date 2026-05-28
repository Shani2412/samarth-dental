'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, getToken, clearAuth, User } from '@/lib/auth';
import api from '@/lib/api';

export function useAuth(required = true, adminOnly = false) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      if (required) router.replace('/login');
      setLoading(false);
      return;
    }

    const cached = getUser();
    if (cached) {
      if (adminOnly && cached.role !== 'ADMIN') {
        router.replace('/website');
        return;
      }
      setUser(cached);
      setLoading(false);
      return;
    }

    // Verify token with backend
    api.get('/auth/me')
      .then(res => {
        const u = res.data.data?.user || res.data.user;
        if (adminOnly && u?.role !== 'ADMIN') { router.replace('/website'); return; }
        setUser(u);
        localStorage.setItem('sd_user', JSON.stringify(u));
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
