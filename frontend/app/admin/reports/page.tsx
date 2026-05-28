'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Loader2, TrendingUp, Users, Calendar, IndianRupee, CheckCircle, XCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

interface Summary {
  totalAppointments: number; totalConfirmed: number;
  totalCancelled: number; totalRevenue: number; newPatients: number;
}
interface MonthData {
  month: number; name: string; appointments: number;
  confirmed: number; cancelled: number; revenue: number;
}
interface ServiceData { name: string; count: number; }
interface RevenueData  { name: string; amount: number; }

interface Reports {
  year: number; summary: Summary;
  monthly: MonthData[]; popularServices: ServiceData[];
  revenueByTreatment: RevenueData[];
}

const COLORS = ['#0B6E68', '#C9A84C', '#6B7280', '#0D9488', '#F59E0B', '#8B5CF6'];

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

function StatCard({ icon, label, value, sub, color = 'teal' }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string;
}) {
  const bg = color === 'teal' ? 'bg-teal-light' : color === 'gold' ? 'bg-gold-light' :
             color === 'green' ? 'bg-green-50' : color === 'red' ? 'bg-red-50' : 'bg-gray-50';
  const tc = color === 'teal' ? 'text-teal' : color === 'gold' ? 'text-gold' :
             color === 'green' ? 'text-green-600' : color === 'red' ? 'text-red-500' : 'text-gray-600';
  return (
    <div className="card p-5">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center ${tc} mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      {sub && <div className={`text-xs ${tc} font-medium mt-1`}>{sub}</div>}
    </div>
  );
}

export default function ReportsPage() {
  const [data, setData]     = useState<Reports | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear]     = useState(new Date().getFullYear());

  const fetchReports = async (y: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reports?year=${y}`);
      setData(res.data.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(year); }, [year]);

  const years = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Clinic performance overview</p>
        </div>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="input-field w-32 text-sm"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-teal" />
        </div>
      ) : !data ? (
        <div className="text-center py-24 text-gray-400">Could not load reports</div>
      ) : (
        <div className="space-y-6">

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard icon={<Calendar className="w-5 h-5" />}    label="Total Appointments" value={data.summary.totalAppointments} color="teal" />
            <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Confirmed"           value={data.summary.totalConfirmed}    color="green"
              sub={data.summary.totalAppointments ? `${Math.round(data.summary.totalConfirmed/data.summary.totalAppointments*100)}% rate` : undefined} />
            <StatCard icon={<XCircle className="w-5 h-5" />}     label="Cancelled"           value={data.summary.totalCancelled}    color="red" />
            <StatCard icon={<Users className="w-5 h-5" />}       label="New Patients"        value={data.summary.newPatients}       color="gold" />
            <StatCard icon={<IndianRupee className="w-5 h-5" />} label="Total Revenue"       value={fmt(data.summary.totalRevenue)} color="teal"
              sub="From visit records" />
          </div>

          {/* Monthly Appointments Chart */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-700 mb-5">Monthly Appointments — {year}</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.monthly} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(val: any, name: any) => [val, String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
                />
                <Bar dataKey="confirmed"    fill="#0B6E68" radius={[4,4,0,0]} name="Confirmed" />
                <Bar dataKey="cancelled"    fill="#FCA5A5" radius={[4,4,0,0]} name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Revenue Chart */}
          {data.summary.totalRevenue > 0 && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-700 mb-5">Monthly Revenue — {year}</h2>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.monthly} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    tickFormatter={(v) => v >= 1000 ? `₹${v/1000}k` : `₹${v}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    formatter={(val: any) => [fmt(Number(val)), 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2.5}
                    dot={{ fill: '#C9A84C', r: 4 }} activeDot={{ r: 6 }} name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Popular Services */}
            {data.popularServices.length > 0 && (
              <div className="card p-5">
                <h2 className="font-semibold text-gray-700 mb-5">Popular Services</h2>
                <div className="space-y-3">
                  {data.popularServices.map((s, i) => {
                    const max = data.popularServices[0].count;
                    const pct = Math.round((s.count / max) * 100);
                    return (
                      <div key={s.name}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-700 font-medium truncate max-w-[200px]">{s.name}</span>
                          <span className="text-gray-400 flex-shrink-0 ml-2">{s.count} bookings</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Revenue by Treatment */}
            {data.revenueByTreatment.length > 0 && (
              <div className="card p-5">
                <h2 className="font-semibold text-gray-700 mb-5">Revenue by Treatment</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.revenueByTreatment}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={85}
                      dataKey="amount"
                      nameKey="name"
                      paddingAngle={3}
                    >
                      {data.revenueByTreatment.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      formatter={(val: any) => [fmt(Number(val)), 'Revenue']}
                    />
                    <Legend
                      formatter={(value) => <span style={{ fontSize: '12px', color: '#6B7280' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Monthly Table */}
          <div className="card overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-700">Monthly Breakdown — {year}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Month','Total','Confirmed','Cancelled','Revenue'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.monthly.map(m => (
                    <tr key={m.month} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-700">{m.name} {year}</td>
                      <td className="px-5 py-3 text-gray-600">{m.appointments}</td>
                      <td className="px-5 py-3">
                        <span className="text-green-600 font-medium">{m.confirmed}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-red-400">{m.cancelled}</span>
                      </td>
                      <td className="px-5 py-3 text-teal font-medium">
                        {m.revenue > 0 ? fmt(m.revenue) : '—'}
                      </td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="bg-teal-light font-semibold">
                    <td className="px-5 py-3 text-teal">Total</td>
                    <td className="px-5 py-3 text-teal">{data.summary.totalAppointments}</td>
                    <td className="px-5 py-3 text-green-600">{data.summary.totalConfirmed}</td>
                    <td className="px-5 py-3 text-red-400">{data.summary.totalCancelled}</td>
                    <td className="px-5 py-3 text-teal">{fmt(data.summary.totalRevenue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
