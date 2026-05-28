'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface User { id: string; name: string; email: string; createdAt: string; _count: { appointments: number; reviews: number }; }

export default function AdminUsers() {
  useAuth(true, true);
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/users')
      .then(res => setUsers(res.data.data.users))
      .catch(() => toast.error('Could not load users'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-800">Patients 👥</h1>
        <p className="text-gray-500 text-sm mt-1">All registered patients</p>
      </div>
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Patient', 'Email', 'Appointments', 'Reviews', 'Joined'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-teal mx-auto" />
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16 text-gray-400">
                  <div className="text-4xl mb-2">👥</div><p>No patients yet</p>
                </td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-teal-light rounded-full flex items-center justify-center text-teal font-bold text-sm">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div className="font-semibold text-sm">{u.name}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className="bg-teal-light text-teal text-xs font-semibold px-3 py-1 rounded-full">
                      {u._count.appointments} bookings
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{u._count.reviews}</td>
                  <td className="px-5 py-4 text-xs text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
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
