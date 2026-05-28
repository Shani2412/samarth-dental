'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Search, User, ChevronRight, Calendar, Loader2 } from 'lucide-react';

interface Patient {
  id: string; name: string; email: string; createdAt: string;
  patientRecord: { bloodGroup?: string; visits: { visitDate: string; treatment: string }[] } | null;
  _count: { appointments: number };
}

export default function AdminPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => fetchPatients(), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/patients?search=${search}`);
      setPatients(res.data.data.patients);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-800">👥 Patient Records</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage patient dental history</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="input-field pl-10" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-teal" /></div>
      ) : patients.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <User className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="font-medium">No patients found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {patients.map(p => {
            const lastVisit = p.patientRecord?.visits?.[0];
            const hasRecord = !!p.patientRecord;
            return (
              <div key={p.id}
                onClick={() => router.push(`/admin/patients/${p.id}`)}
                className="card p-5 flex items-center gap-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all">
                {/* Avatar */}
                <div className="w-12 h-12 bg-teal-light rounded-full flex items-center justify-center text-teal font-bold text-lg flex-shrink-0">
                  {p.name[0].toUpperCase()}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">{p.name}</span>
                    {hasRecord ? (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Record exists</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">No record yet</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 truncate">{p.email}</div>
                  {lastVisit && (
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Last visit: {lastVisit.visitDate} — {lastVisit.treatment}
                    </div>
                  )}
                </div>
                {/* Stats */}
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <div className="text-lg font-bold text-teal">{p._count.appointments}</div>
                  <div className="text-xs text-gray-400">appointments</div>
                </div>
                {p.patientRecord?.bloodGroup && (
                  <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-red-50 rounded-full flex-shrink-0">
                    <span className="text-xs font-bold text-red-500">{p.patientRecord.bloodGroup}</span>
                  </div>
                )}
                <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
