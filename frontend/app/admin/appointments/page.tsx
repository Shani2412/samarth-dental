'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Search, Loader2 } from 'lucide-react';

interface Appointment {
  id: string; name: string; phone: string; email: string;
  service: string; date?: string; time?: string; message?: string;
  status: string; createdAt: string;
}

const FILTERS = ['all', 'PENDING', 'CONFIRMED', 'CANCELLED'];

export default function AdminAppointments() {
  useAuth(true, true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [total, setTotal]       = useState(0);

  useEffect(() => { load(); }, [filter, search]);

  async function load() {
    try {
      setLoading(true);
      const res = await api.get(`/admin/appointments?status=${filter}&search=${search}`);
      setAppointments(res.data.data);
      setTotal(res.data.pagination?.total || res.data.data.length);
    } catch { toast.error('Could not load appointments'); }
    finally { setLoading(false); }
  }

  async function updateStatus(id: string, status: string) {
    try {
      await api.patch(`/admin/appointments/${id}`, { status });
      toast.success(status === 'CONFIRMED' ? '✅ Appointment confirmed!' : '❌ Appointment cancelled');
      load();
    } catch { toast.error('Update failed'); }
  }

  async function deleteAppt(id: string) {
    if (!confirm('Delete this appointment?')) return;
    try {
      await api.delete(`/admin/appointments/${id}`);
      toast.success('🗑️ Deleted');
      load();
    } catch { toast.error('Delete failed'); }
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-800">Appointments 📅</h1>
        <p className="text-gray-500 text-sm mt-1">Manage all patient bookings</p>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Search name, phone, service..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal w-56"
            />
          </div>
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  filter === f ? 'bg-teal text-white border-teal' : 'bg-white text-gray-500 border-gray-200 hover:border-teal hover:text-teal'
                }`}>
                {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <span className="ml-auto text-sm text-gray-400">{total} appointment{total !== 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Patient', 'Service', 'Date & Time', 'Message', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-teal mx-auto" />
                </td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-400">
                  <div className="text-4xl mb-2">📅</div>
                  <p>No appointments found</p>
                </td></tr>
              ) : appointments.map(a => (
                <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-sm">{a.name}</div>
                    <div className="text-xs text-gray-400">📞 {a.phone}</div>
                    <div className="text-xs text-gray-400">✉️ {a.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="bg-teal-light text-teal text-xs font-medium px-3 py-1 rounded-full">{a.service}</span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">
                    <div>{a.date || '—'}</div>
                    <div className="text-xs">{a.time || ''}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400 max-w-[140px]">
                    {a.message || '—'}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold status-${a.status.toLowerCase()}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5">
                      {a.status !== 'CONFIRMED' && (
                        <button onClick={() => updateStatus(a.id, 'CONFIRMED')}
                          className="text-xs bg-green-500 text-white px-2.5 py-1.5 rounded-lg hover:opacity-80">✅</button>
                      )}
                      {a.status !== 'CANCELLED' && (
                        <button onClick={() => updateStatus(a.id, 'CANCELLED')}
                          className="text-xs bg-red-500 text-white px-2.5 py-1.5 rounded-lg hover:opacity-80">❌</button>
                      )}
                      <button onClick={() => deleteAppt(a.id)}
                        className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1.5 rounded-lg hover:bg-gray-200">🗑</button>
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
