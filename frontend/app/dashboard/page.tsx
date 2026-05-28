'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Appointment {
  id: string; service: string; date?: string; time?: string;
  status: string; phone: string; createdAt: string; message?: string;
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const router = useRouter();

  useEffect(() => {
    api.get('/appointments/my')
      .then(res => setAppointments(res.data.data.appointments))
      .catch(() => {});
  }, []);

  const total     = appointments.length;
  const pending   = appointments.filter(a => a.status === 'PENDING').length;
  const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length;

  const statusLabel: Record<string, string> = {
    PENDING: '⏳ Pending Confirmation',
    CONFIRMED: '✅ Confirmed',
    CANCELLED: '❌ Cancelled',
  };

  return (
    <div>
      {/* Welcome */}
      <div className="bg-gradient-to-r from-teal to-teal-mid rounded-2xl p-7 text-white mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-white/80 text-sm">Manage your dental appointments easily.</p>
        </div>
        <button onClick={() => router.push('/dashboard/book')}
          className="bg-white text-teal font-semibold px-5 py-2.5 rounded-lg text-sm hover:-translate-y-0.5 transition-all hover:shadow-lg whitespace-nowrap">
          + Book Appointment
        </button>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: '📋', val: total,     label: 'Total Bookings' },
          { icon: '⏳', val: pending,   label: 'Pending' },
          { icon: '✅', val: confirmed, label: 'Confirmed' },
        ].map(s => (
          <div key={s.label} className="card p-5 text-center">
            <div className="text-3xl mb-1">{s.icon}</div>
            <div className="text-3xl font-bold text-gray-800">{s.val}</div>
            <div className="text-xs text-gray-400 uppercase tracking-wide mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent appointments */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="font-semibold text-gray-700">📅 Recent Appointments</span>
          <button onClick={() => router.push('/dashboard/appointments')}
            className="text-sm text-teal hover:underline">View All →</button>
        </div>
        <div className="p-5 space-y-3">
          {appointments.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-2">📅</div>
              <p className="mb-4">No appointments yet</p>
              <button onClick={() => router.push('/dashboard/book')}
                className="btn-teal px-6 py-2.5 rounded-lg">
                Book Now →
              </button>
            </div>
          ) : appointments.slice(0, 4).map(a => {
            const d = a.date ? new Date(a.date) : null;
            return (
              <div key={a.id}
                className={`flex items-center gap-4 p-4 rounded-xl border-l-4 bg-white shadow-sm ${
                  a.status === 'PENDING' ? 'border-orange-400' :
                  a.status === 'CONFIRMED' ? 'border-green-500' : 'border-red-400'
                }`}>
                <div className="bg-teal-light rounded-xl p-3 text-center min-w-[56px]">
                  <div className="text-2xl font-bold text-teal leading-none">{d ? d.getDate() : '—'}</div>
                  <div className="text-xs text-teal-mid font-semibold uppercase">
                    {d ? d.toLocaleString('en-IN', { month: 'short' }) : ''}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{a.service}</div>
                  <div className="text-xs text-gray-400 mt-0.5 flex gap-3">
                    {a.time && <span>🕐 {a.time}</span>}
                    {a.phone && <span>📞 {a.phone}</span>}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full status-${a.status.toLowerCase()}`}>
                  {statusLabel[a.status]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
