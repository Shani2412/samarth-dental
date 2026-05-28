'use client';
import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { saveAuth } from '@/lib/auth';

type SignupForm = { name: string; email: string; password: string };

function SignupForm() {
  const [showPw, setShowPw]     = useState(false);
  const [strength, setStrength] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '';

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignupForm>();

  const checkStrength = (val: string) => {
    let s = 0;
    if (val.length >= 6)          s++;
    if (val.length >= 10)         s++;
    if (/[A-Z]/.test(val))        s++;
    if (/[0-9]/.test(val))        s++;
    if (/[^A-Za-z0-9]/.test(val)) s++;
    setStrength(s);
  };

  const strengthConfig = [
    { label: 'Weak',        color: 'bg-red-500'   },
    { label: 'Fair',        color: 'bg-orange-400' },
    { label: 'Good',        color: 'bg-yellow-400' },
    { label: 'Strong',      color: 'bg-green-500'  },
    { label: 'Very Strong', color: 'bg-teal'       },
  ];

  const onSubmit = async (data: SignupForm) => {
    try {
      const res = await api.post('/auth/signup', data);
      const { token, user } = res.data.data;
      saveAuth(token, user);
      toast.success(`Account created! Welcome, ${user.name}!`);
      router.push(redirect || '/website');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 bg-teal flex-col justify-center items-center p-16 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/4 rounded-full" />
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="text-7xl mb-5">🦷</div>
          <h1 className="font-display text-5xl font-bold mb-3 leading-tight">Samarth<br />Dental Care</h1>
          <p className="text-white/75 text-base mb-12 leading-relaxed">Vijapur, Mehsana — Gujarat<br />Your smile, our priority</p>
          <div className="bg-white/10 rounded-2xl p-6 text-left">
            <p className="text-white font-semibold mb-3">✨ Why create an account?</p>
            <ul className="space-y-2 text-white/80 text-sm">
              <li>✅ Book appointments online</li>
              <li>✅ Track appointment status</li>
              <li>✅ Get email confirmations</li>
              <li>✅ Leave reviews</li>
              <li>✅ Access your history</li>
            </ul>
          </div>
        </div>
        <p className="absolute bottom-6 text-white/35 text-xs">© 2025 Samarth Dental Care · Vijapur</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[480px] flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Back to website */}
          <button onClick={() => router.push('/website')}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-teal transition-colors mb-6">
            ← Back to website
          </button>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <Link href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="flex-1 py-2.5 text-center text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
              Login
            </Link>
            <span className="flex-1 py-2.5 text-center text-sm font-semibold text-teal bg-white rounded-lg shadow-sm">Sign Up</span>
          </div>

          <h2 className="font-display text-3xl font-bold mb-1">Create account 🎉</h2>
          <p className="text-gray-500 text-sm mb-7">Join Samarth Dental Care today</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Your full name"
                  className={`input-field pl-10 ${errors.name ? 'border-red-400' : ''}`}
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

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

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPw ? 'text' : 'password'} placeholder="Min 6 characters"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Min 6 characters' },
                    onChange: (e) => checkStrength(e.target.value),
                  })} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              {watch('password') && (
                <div className="mt-2">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${strengthConfig[Math.min(strength,4)].color}`}
                      style={{ width: `${(strength/5)*100}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{strengthConfig[Math.min(strength,4)].label}</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-teal w-full py-3 rounded-xl text-base mt-2">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account →'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Google Signup */}
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="flex items-center justify-center gap-3 w-full py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <p className="text-center text-xs text-gray-500 mt-5">
            Already have an account?{' '}
            <Link href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="text-teal font-semibold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return <Suspense><SignupForm /></Suspense>;
}
