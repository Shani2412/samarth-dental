'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Loader2, Calendar, Pill, FileText, IndianRupee, ClipboardList } from 'lucide-react';

interface Visit {
  id: string; visitDate: string; treatment: string;
  toothNumbers?: string; medicines?: string; notes?: string;
  nextVisitDate?: string; amountCharged?: number;
}
interface Record {
  bloodGroup?: string; allergies?: string;
  existingProblems?: string; notes?: string;
  visits: Visit[];
}

export default function MyHistoryPage() {
  const [record, setRecord]   = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/my-record')
      .then(res => setRecord(res.data.data.record))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-8 h-8 animate-spin text-teal" />
    </div>
  );

  const visits = record?.visits || [];
  const nextVisit = visits.find(v => v.nextVisitDate && new Date(v.nextVisitDate) >= new Date());

  return (
    <div className="max-w-3xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-800">📋 My Dental History</h1>
        <p className="text-gray-500 text-sm mt-1">Your treatment records maintained by the clinic</p>
      </div>

      {/* Next visit reminder */}
      {nextVisit?.nextVisitDate && (
        <div className="bg-teal-light border border-teal/20 rounded-xl p-4 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-teal rounded-full flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-teal text-sm">Upcoming Visit Scheduled</div>
            <div className="text-gray-600 text-sm">
              {new Date(nextVisit.nextVisitDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      )}

      {/* Medical Info */}
      {record && (record.bloodGroup || record.allergies || record.existingProblems) && (
        <div className="card p-5 mb-5">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide mb-4">My Medical Info</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {record.bloodGroup && (
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <div className="text-2xl font-bold text-red-500">{record.bloodGroup}</div>
                <div className="text-xs text-gray-400 mt-1">Blood Group</div>
              </div>
            )}
            {record.allergies && (
              <div className="p-3 bg-orange-50 rounded-xl sm:col-span-1">
                <div className="text-xs text-orange-500 font-semibold mb-1">⚠️ Allergies</div>
                <div className="text-sm text-gray-700">{record.allergies}</div>
              </div>
            )}
            {record.existingProblems && (
              <div className="p-3 bg-gray-50 rounded-xl sm:col-span-1">
                <div className="text-xs text-gray-500 font-semibold mb-1">Existing Issues</div>
                <div className="text-sm text-gray-700">{record.existingProblems}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visit History */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            Treatment History ({visits.length})
          </h2>
        </div>

        {visits.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-gray-500">No treatment records yet</p>
            <p className="text-sm mt-1 text-gray-400">Your treatment history will appear here after your visit</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
            <div className="space-y-4">
              {visits.map((v) => (
                <div key={v.id} className="relative pl-10">
                  <div className="absolute left-2.5 top-3 w-3 h-3 rounded-full bg-teal border-2 border-white shadow-sm -translate-x-1/2" />
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="font-semibold text-gray-800">{v.treatment}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(v.visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                      {v.amountCharged && (
                        <span className="text-sm font-semibold text-teal flex items-center gap-0.5 flex-shrink-0">
                          <IndianRupee className="w-3 h-3" />{v.amountCharged.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      {v.toothNumbers && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-500 font-medium flex-shrink-0">Tooth</span>
                          <span className="text-gray-600">{v.toothNumbers}</span>
                        </div>
                      )}
                      {v.medicines && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5 text-blue-500 font-medium flex-shrink-0 flex items-center gap-1">
                            <Pill className="w-2.5 h-2.5" /> Rx
                          </span>
                          <span className="text-gray-600">{v.medicines}</span>
                        </div>
                      )}
                      {v.notes && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs bg-yellow-50 border border-yellow-100 rounded px-1.5 py-0.5 text-yellow-600 font-medium flex-shrink-0">Notes</span>
                          <span className="text-gray-600">{v.notes}</span>
                        </div>
                      )}
                      {v.nextVisitDate && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-green-600 font-medium">📅 Next visit:</span>
                          <span className="text-xs text-gray-500">
                            {new Date(v.nextVisitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
