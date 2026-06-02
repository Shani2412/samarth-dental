'use client';
// ================================================================
// FILE: frontend/app/reset-password/page.tsx   ← NAYA FILE
// ACTION: frontend/app/reset-password/ folder banao
//         uske andar page.tsx naam se save karo
// ================================================================

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/api';

type ResetForm = { password: string; confirmPassword: string };

function ResetPasswordHandler() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone]             = useState(false);
  const [invalid, setInvalid]       = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ResetForm>();

  useEffect(() => {
    if (!token || !email) setInvalid(true);
  }, [token, email]);

  const onSubmit = async (data: ResetForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    try {
      await api.post('/auth/reset-password', {
        token,
        email,
        password: data.password,
      });
      setDone(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Reset failed. Please try again.';
      toast.error(msg);
    }
  };

  // Invalid link
  if (invalid) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Invalid Link</h2>
        <p className="text-gray-500 text-sm mb-6">
          This reset link is invalid or has expired. Please request a new one.
        </p>
        <Link href="/forgot-password" className="btn-teal px-6 py-2.5 rounded-xl inline-block">
          Request New Link
        </Link>
      </div>
    </div>
  );

  // Success
  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Password Reset!</h2>
        <p className="text-gray-500 text-sm mb-2">
          Your password has been updated successfully.
        </p>
        <p className="text-gray-400 text-xs">Redirecting to login...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Set New Password</h1>
            <p className="text-gray-500 text-sm">
              Choose a strong password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Min 6 characters' },
                  })}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  className={`input-field pl-10 pr-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: val => val === watch('password') || 'Passwords do not match',
                  })}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-teal w-full py-3 rounded-xl text-base flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Resetting...</>
                : 'Reset Password'
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordHandler /></Suspense>;
}