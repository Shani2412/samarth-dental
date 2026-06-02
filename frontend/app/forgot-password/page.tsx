'use client';
// ================================================================
// FILE: frontend/app/forgot-password/page.tsx   ← NAYA FILE
// ACTION: frontend/app/forgot-password/ folder banao
//         uske andar page.tsx naam se save karo
// ================================================================

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

type ForgotForm = { email: string };

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotForm>();

  const onSubmit = async (data: ForgotForm) => {
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSentTo(data.email);
      setSent(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {!sent ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-teal-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password?</h1>
                <p className="text-gray-500 text-sm">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className={`input-field pl-10 ${errors.email ? 'border-red-400' : ''}`}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-teal w-full py-3 rounded-xl text-base flex items-center justify-center gap-2"
                >
                  {isSubmitting
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                    : 'Send Reset Link'
                  }
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Check Your Email</h2>
                <p className="text-gray-500 text-sm mb-2">
                  We sent a password reset link to:
                </p>
                <p className="text-teal-600 font-semibold mb-4">{sentTo}</p>
                <p className="text-gray-400 text-xs mb-6">
                  Link is valid for 1 hour. Check your spam folder if you don't see it.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="text-sm text-teal-600 hover:underline font-medium"
                >
                  Try a different email
                </button>
              </div>
            </>
          )}

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}