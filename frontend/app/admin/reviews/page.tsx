'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface Review {
  id: string; name: string; location: string; stars: number;
  text: string; approved: boolean; createdAt: string;
}

export default function AdminReviews() {
  useAuth(true, true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await api.get('/admin/reviews');
      setReviews(res.data.data.reviews);
    } catch { toast.error('Could not load reviews'); }
    finally { setLoading(false); }
  }

  const filtered = filter === 'approved' ? reviews.filter(r => r.approved)
    : filter === 'pending' ? reviews.filter(r => !r.approved) : reviews;

  async function updateApproval(id: string, approved: boolean) {
    try {
      await api.patch(`/admin/reviews/${id}`, { approved });
      toast.success(approved ? '✅ Review approved!' : '↩️ Unpublished');
      load();
    } catch { toast.error('Update failed'); }
  }

  async function deleteReview(id: string) {
    if (!confirm('Delete this review?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      toast.success('🗑️ Deleted');
      load();
    } catch { toast.error('Delete failed'); }
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-800">Reviews ⭐</h1>
        <p className="text-gray-500 text-sm mt-1">Approve or reject patient reviews</p>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex gap-2 items-center">
          {[['all','All'],['pending','⏳ Pending'],['approved','✅ Approved']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                filter === val ? 'bg-teal text-white border-teal' : 'bg-white text-gray-500 border-gray-200 hover:border-teal hover:text-teal'
              }`}>{label}</button>
          ))}
          <span className="ml-auto text-sm text-gray-400">{filtered.length} review{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Patient & Review', 'Rating', 'Location', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-teal mx-auto" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-gray-400">
                  <div className="text-4xl mb-2">⭐</div><p>No reviews found</p>
                </td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-4 max-w-xs">
                    <div className="font-semibold text-sm">{r.name}</div>
                    <div className="text-sm text-gray-500 italic mt-1 line-clamp-2">"{r.text}"</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-gold text-base">{'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}</div>
                    <div className="text-xs text-gray-400">{r.stars}/5</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{r.location}</td>
                  <td className="px-5 py-4 text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-4">
                    {r.approved
                      ? <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">✅ Live</span>
                      : <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">⏳ Pending</span>
                    }
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5">
                      {!r.approved && (
                        <button onClick={() => updateApproval(r.id, true)}
                          className="text-xs bg-teal text-white px-2.5 py-1.5 rounded-lg hover:opacity-80">✅ Approve</button>
                      )}
                      {r.approved && (
                        <button onClick={() => updateApproval(r.id, false)}
                          className="text-xs bg-orange-400 text-white px-2.5 py-1.5 rounded-lg hover:opacity-80">↩️ Unpublish</button>
                      )}
                      <button onClick={() => deleteReview(r.id)}
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
