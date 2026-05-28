'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2, MapPin, MessageSquare } from 'lucide-react';

type ReviewForm = { stars: number; location: string; text: string };

export default function LeaveReview() {
  useAuth();
  const [selectedStars, setSelectedStars] = useState(5);
  const [hoveredStars, setHoveredStars]   = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ReviewForm>({
    defaultValues: { stars: 5 },
  });

  const onSubmit = async (data: ReviewForm) => {
    try {
      await api.post('/reviews', { ...data, stars: selectedStars });
      toast.success('🌟 Review submitted! It is now live on the website.');
      setSubmitted(true);
      reset();
      setSelectedStars(5);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not submit review.');
    }
  };

  if (submitted) return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <div className="card p-10">
        <div className="text-5xl mb-4">🌟</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
        <p className="text-gray-500 text-sm mb-6">Your review has been submitted and is now live on the website!</p>
        <button onClick={() => setSubmitted(false)} className="btn-teal px-8 py-3 rounded-xl">
          Write Another Review
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-800">Leave a Review ⭐</h1>
        <p className="text-gray-500 text-sm mt-1">Share your experience with other patients</p>
      </div>

      <div className="max-w-xl">
        <div className="card p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-3">Your Rating *</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button"
                    onClick={() => setSelectedStars(s)}
                    onMouseEnter={() => setHoveredStars(s)}
                    onMouseLeave={() => setHoveredStars(0)}
                    className="text-4xl transition-transform hover:scale-110 focus:outline-none">
                    <span className={(hoveredStars || selectedStars) >= s ? 'text-gold' : 'text-gray-200'}>★</span>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {selectedStars === 5 ? '🤩 Excellent!' : selectedStars === 4 ? '😊 Good' :
                 selectedStars === 3 ? '😐 Average' : selectedStars === 2 ? '😕 Below Average' : '😞 Poor'}
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Your Location</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="e.g. Vijapur, Mehsana"
                  className="input-field pl-10"
                  {...register('location')} />
              </div>
            </div>

            {/* Review text */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Your Review *</label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <textarea rows={5}
                  placeholder="Tell others about your experience at Samarth Dental Care..."
                  className={`input-field pl-10 resize-none ${errors.text ? 'border-red-400' : ''}`}
                  {...register('text', {
                    required: 'Please write your review',
                    minLength: { value: 10, message: 'Review must be at least 10 characters' },
                  })} />
              </div>
              {errors.text && <p className="text-red-500 text-xs mt-1">{errors.text.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-teal w-full py-3.5 rounded-xl text-base">
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : 'Submit Review →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
