'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface Appointment {
  id: string; service: string; date?: string; time?: string;
  status: string; phone: string; message?: string; createdAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING:   '⏳ Pending',
  CONFIRMED: '✅ Confirmed',
  CANCELLED: '❌ Cancelled',
};

export default function MyAppointments() {
  useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get('/appointments/my')
      .then(res => setAppointments(res.data.data.appointments))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Appointments 📋</h1>
          <p className="text-gray-500 text-sm mt-1">All your past and upcoming bookings</p>
        </div>
        <button onClick={() => router.push('/dashboard/book')} className="btn-teal px-5 py-2.5 rounded-lg">
          + New Booking
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-teal" /></div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">📅</div>
          <p className="text-lg mb-4">No appointments yet</p>
          <button onClick={() => router.push('/dashboard/book')} className="btn-teal px-8 py-3 rounded-xl">
            Book Your First Appointment →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(a => {
            const d = a.date ? new Date(a.date) : null;
            return (
              <div key={a.id}
                className={`card flex items-center gap-5 p-5 border-l-4 ${
                  a.status === 'PENDING' ? 'border-orange-400' :
                  a.status === 'CONFIRMED' ? 'border-green-500' : 'border-red-400'
                }`}>
                <div className="bg-teal-light rounded-xl p-3 text-center min-w-[64px]">
                  <div className="text-3xl font-bold text-teal leading-none">{d ? d.getDate() : '—'}</div>
                  <div className="text-xs text-teal-mid font-semibold uppercase">
                    {d ? d.toLocaleString('en-IN', { month: 'short' }) : ''}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-base">{a.service}</div>
                  <div className="flex gap-4 mt-1 text-xs text-gray-400">
                    {a.time    && <span>🕐 {a.time}</span>}
                    {a.phone   && <span>📞 {a.phone}</span>}
                    <span>📅 Booked {new Date(a.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  {a.message && <div className="text-xs text-gray-400 mt-1">💬 {a.message}</div>}
                </div>
                <span className={`text-xs font-semibold px-4 py-2 rounded-full status-${a.status.toLowerCase()}`}>
                  {STATUS_LABEL[a.status]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
