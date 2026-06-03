'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Phone, Calendar, Clock, MessageSquare } from 'lucide-react';

type BookForm = {
  phone: string; service: string; date: string; time: string; message: string;
};

const SERVICES = [
  'General Check-up','Missing teeth replacement', 'Teeth Cleaning', 'Root Canal Treatment',
  'Tooth Extraction', 'Teeth Whitening', 'Dental Implants',
  'Orthodontics / Braces', 'Pediatric Dentistry', 'Emergency Consultation', 'Other',
];

const TIMES = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM'];

export default function BookAppointment() {
  const { user } = useAuth();
  const router = useRouter();
  const [booked, setBooked] = useState<BookForm | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BookForm>();

  const onSubmit = async (data: BookForm) => {
    try {
      await api.post('/appointments', data);
      setBooked(data);
      toast.success('🎉 Appointment booked successfully!');
      reset();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    }
  };

  const openWhatsApp = () => {
    if (!booked || !user) return;
    const phone = process.env.NEXT_PUBLIC_CLINIC_PHONE || '919999999999';
    const text = encodeURIComponent(
      `Hello Samarth Dental Care! 🦷\n\nI just booked an appointment.\n\nName: ${user.name}\nPhone: ${booked.phone}\nService: ${booked.service}${booked.date ? '\nDate: ' + booked.date : ''}\nTime: ${booked.time}${booked.message ? '\nNote: ' + booked.message : ''}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  if (booked) return (
    <div className="max-w-md mx-auto mt-16 text-center">
      <div className="card p-10">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Appointment Requested!</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Your <strong>{booked.service}</strong> appointment on <strong>{booked.date || 'date TBD'}</strong> at <strong>{booked.time}</strong> has been submitted. We will confirm your slot shortly!
        </p>
        <div className="space-y-3">
          <button onClick={openWhatsApp}
            className="w-full bg-[#25D366] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            💬 Confirm on WhatsApp
          </button>
          <button onClick={() => { setBooked(null); router.push('/dashboard/appointments'); }}
            className="w-full btn-teal py-3 rounded-xl">
            View My Appointments →
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-800">Book Appointment 📅</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to request a slot</p>
      </div>

      <div className="max-w-2xl">
        <div className="card p-7">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" placeholder="+91 XXXXX XXXXX"
                  className={`input-field pl-10 ${errors.phone ? 'border-red-400' : ''}`}
                  {...register('phone', { required: 'Phone is required' })} />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            {/* Service */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Select Service *</label>
              <select className={`input-field ${errors.service ? 'border-red-400' : ''}`}
                {...register('service', { required: 'Please select a service' })}>
                <option value="">-- Select a service --</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.service && <p className="text-red-500 text-xs mt-1">{errors.service.message}</p>}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Preferred Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="date" className="input-field pl-10"
                    min={new Date().toISOString().split('T')[0]}
                    {...register('date')} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Preferred Time</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select className="input-field pl-10" {...register('time')}>
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Additional Notes</label>
              <div className="relative">
                <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                <textarea rows={3} placeholder="Any specific concerns or questions..."
                  className="input-field pl-10 resize-none"
                  {...register('message')} />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-teal w-full py-3.5 rounded-xl text-base">
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Booking...</> : 'Request Appointment →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
