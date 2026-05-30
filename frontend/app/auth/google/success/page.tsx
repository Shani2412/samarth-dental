'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveAuth } from '@/lib/auth';
import api from '@/lib/api';

function GoogleSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token    = searchParams.get('token');
    const name     = searchParams.get('name');
    const role     = searchParams.get('role') as 'ADMIN' | 'USER';
    const id       = searchParams.get('id');
    const redirect = searchParams.get('redirect');

    if (token && name && role && id) {
      // Save basic info first
      saveAuth(token, { id, name: decodeURIComponent(name), role, email: '' });

      // Fetch full user info from backend
      api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          const u = res.data.data?.user || res.data.user;
          if (u) saveAuth(token, u);
        })
        .catch(() => {})
        .finally(() => {
          router.replace(redirect || (role === 'ADMIN' ? '/admin' : '/website'));
        });
    } else {
      router.replace('/login?error=google_failed');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Signing you in with Google...</p>
      </div>
    </div>
  );
}

export default function GoogleSuccessPage() {
  return <Suspense><GoogleSuccessHandler /></Suspense>;
}
