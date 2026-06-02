'use client';
// ================================================================
// FILE: frontend/app/login/page.tsx
// ACTION: Poora file REPLACE karo iss se
// Kya add hua: "Forgot password?" link password field ke neeche
// ================================================================

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { saveAuth, clearAuth, getToken, getUser } from '@/lib/auth';

type LoginForm = { email: string; password: string };

function LoginForm() {
  const [showPw, setShowPw] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'google_failed') toast.error('Google login failed. Please try again.');
    const token = getToken();
    if (!token) return;
    try {
      const u = getUser();
      if (u?.role) router.replace(redirect || (u.role === 'ADMIN' ? '/admin' : '/website'));
    } catch {}
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      clearAuth();
      const res = await api.post('/auth/login', data);
      const { token, user } = res.data.data;
      saveAuth(token, user);
      toast.success(`Welcome back, ${user.name}!`);
      router.push(redirect || (user.role === 'ADMIN' ? '/admin' : '/website'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-teal flex-col justify-center items-center p-16 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/4 rounded-full" />
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 overflow-hidden shadow-lg">
            <img src="/logo.png" alt="Samarth Dental" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="font-display text-5xl font-bold mb-3 leading-tight">Samarth<br />Dental Clinic</h1>
          <p className="text-white/75 text-base mb-12 leading-relaxed">Vijapur, Mehsana — Gujarat<br />Your smile, our priority</p>
          <div className="space-y-4 text-left">
            {[
              { icon: '📅', title: 'Easy Booking',  sub: 'Book appointments anytime' },
              { icon: '📋', title: 'Track Status',  sub: 'See confirmed & pending slots' },
              { icon: '⭐', title: 'Leave Reviews', sub: 'Share your experience' },
              { icon: '🔔', title: 'Email Alerts',  sub: 'Get notified on confirmation' },
            ].map(f => (
              <div key={f.title} className="flex items-center gap-4 text-white/85">
                <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{f.icon}</div>
                <div>
                  <div className="font-semibold text-sm">{f.title}</div>
                  <div className="text-xs text-white/60">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="absolute bottom-6 text-white/35 text-xs">© 2025 Samarth Dental Clinic · Vijapur</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[480px] flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <button onClick={() => router.push('/website')}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-teal transition-colors mb-6">
            ← Back to website
          </button>

          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <span className="flex-1 py-2.5 text-center text-sm font-semibold text-teal bg-white rounded-lg shadow-sm">Login</span>
            <Link href={`/signup${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="flex-1 py-2.5 text-center text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
              Sign Up
            </Link>
          </div>

          <h2 className="font-display text-3xl font-bold mb-1">Welcome back 👋</h2>
          <p className="text-gray-500 text-sm mb-7">Login to manage your appointments</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" placeholder="you@example.com"
                  className={`input-field pl-10 ${errors.email ? 'border-red-400' : ''}`}
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} placeholder="Enter your password"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  {...register('password', { required: 'Password is required' })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}

              {/* ── Forgot Password Link ── */}
              <div className="text-right mt-1">
                <Link href="/forgot-password" className="text-xs text-teal hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-teal w-full py-3 rounded-xl text-base mt-2">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login →'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Google Login */}
          <a href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="flex items-center justify-center gap-3 w-full py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <p className="text-center text-xs text-gray-500 mt-5">
            Don&apos;t have an account?{' '}
            <Link href={`/signup${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="text-teal font-semibold hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}