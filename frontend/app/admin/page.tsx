'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Stats {
  appointments: { total: number; pending: number; confirmed: number; cancelled: number };
  reviews:      { total: number; pending: number };
  users:        { total: number };
}

interface Appointment {
  id: string; name: string; phone: string; email: string;
  service: string; date?: string; time?: string; status: string; createdAt: string;
}

export default function AdminDashboard() {
  const { user } = useAuth(true, true);
  const [stats, setStats]   = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Appointment[]>([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [statsRes, apptRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/appointments?limit=8'),
      ]);
      setStats(statsRes.data.data);
      setRecent(apptRes.data.data);
    } catch { toast.error('Could not load dashboard data'); }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await api.patch(`/admin/appointments/${id}`, { status });
      toast.success(status === 'CONFIRMED' ? '✅ Confirmed!' : '❌ Cancelled');
      loadData();
    } catch { toast.error('Update failed'); }
  }

  const statCards = [
    { label: 'Total',     value: stats?.appointments.total,     color: 'border-teal',       icon: '📋' },
    { label: 'Pending',   value: stats?.appointments.pending,   color: 'border-orange-400', icon: '⏳' },
    { label: 'Confirmed', value: stats?.appointments.confirmed, color: 'border-green-500',  icon: '✅' },
    { label: 'Cancelled', value: stats?.appointments.cancelled, color: 'border-red-400',    icon: '❌' },
    { label: 'Reviews',   value: stats?.reviews.total,          color: 'border-gold',       icon: '⭐' },
    { label: 'Patients',  value: stats?.users.total,            color: 'border-purple-400', icon: '👥' },
  ];

  const statusColors: Record<string, string> = {
    PENDING:   'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-500',
    COMPLETED: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard 📊</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <a href="/website" target="https://www.samarthdentalcare.in"
          className="text-xs border border-gray-200 bg-white px-3 py-2 rounded-lg hover:border-teal hover:text-teal transition-all">
          🌐 View Website
        </a>
      </div>

      {/* Stats Grid — 2 col mobile, 3 col tablet, 6 col desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {statCards.map(s => (
          <div key={s.label} className={`card border-l-4 ${s.color} p-4`}>
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-xs uppercase tracking-wide text-gray-400 font-semibold leading-tight">{s.label}</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{s.value ?? '—'}</div>
          </div>
        ))}
      </div>

      {/* Recent Appointments */}
      <div className="card">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <span className="font-semibold text-gray-700 text-sm">📅 Recent Appointments</span>
          <a href="/admin/appointments" className="text-xs text-teal hover:underline">View All →</a>
        </div>

        {/* Mobile — Card view */}
        <div className="md:hidden divide-y divide-gray-50">
          {recent.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No appointments yet</div>
          ) : recent.map(a => (
            <div key={a.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="font-semibold text-sm text-gray-800">{a.name}</div>
                  <div className="text-xs text-gray-400">📞 {a.phone}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${statusColors[a.status] || 'bg-gray-100 text-gray-500'}`}>
                  {a.status}
                </span>
              </div>
              <div className="text-xs text-teal font-medium mb-1">{a.service}</div>
              <div className="text-xs text-gray-400">{a.date || '—'} {a.time ? `· ${a.time}` : ''}</div>
              {a.status === 'PENDING' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => updateStatus(a.id, 'CONFIRMED')}
                    className="flex-1 text-xs bg-green-500 text-white py-2 rounded-lg">
                    ✅ Confirm
                  </button>
                  <button onClick={() => updateStatus(a.id, 'CANCELLED')}
                    className="flex-1 text-xs bg-red-500 text-white py-2 rounded-lg">
                    ❌ Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop — Table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Patient', 'Service', 'Date & Time', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No appointments yet</td></tr>
              ) : recent.map(a => (
                <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-sm text-gray-800">{a.name}</div>
                    <div className="text-xs text-gray-400">📞 {a.phone}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="bg-teal-light text-teal text-xs font-medium px-3 py-1 rounded-full">{a.service}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {a.date || '—'} {a.time ? `· ${a.time}` : ''}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[a.status] || 'bg-gray-100 text-gray-500'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {a.status === 'PENDING' && (
                        <>
                          <button onClick={() => updateStatus(a.id, 'CONFIRMED')}
                            className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:opacity-80">
                            ✅ Confirm
                          </button>
                          <button onClick={() => updateStatus(a.id, 'CANCELLED')}
                            className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:opacity-80">
                            ❌ Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
