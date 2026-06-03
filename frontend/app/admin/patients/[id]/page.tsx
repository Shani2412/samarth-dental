'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, Edit2, Loader2, X, Save, Calendar, Pill, FileText, IndianRupee } from 'lucide-react';

interface Visit {
  id: string; visitDate: string; treatment: string;
  toothNumbers?: string; medicines?: string; notes?: string;
  nextVisitDate?: string; amountCharged?: number;
}
interface PatientRecord {
  bloodGroup?: string; allergies?: string;
  existingProblems?: string; lastDentalVisit?: string; notes?: string;
  visits: Visit[];
}
interface Patient {
  id: string; name: string; email: string; createdAt: string;
  patientRecord: PatientRecord | null;
  appointments: { id: string; service: string; date: string; status: string }[];
  _count: { appointments: number };
}

const TREATMENTS = [
  'Teeth Cleaning','Missing teeth replacement', 'Teeth Whitening', 'Root Canal (RCT)',
  'Dental Crown', 'Tooth Extraction', 'Braces Adjustment',
  'Clear Aligner Fitting', 'Dental Implant', 'Dental Filling',
  'Scaling & Polishing', 'X-Ray', 'Consultation', 'Other',
];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [patient, setPatient]       = useState<Patient | null>(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [editingRecord, setEditingRecord]   = useState(false);
  const [editingVisit, setEditingVisit]     = useState<Visit | null>(null);

  const [record, setRecord] = useState({
    bloodGroup: '', allergies: '', existingProblems: '', lastDentalVisit: '', notes: '',
  });

  const [visit, setVisit] = useState({
    visitDate: new Date().toISOString().split('T')[0],
    treatment: '', toothNumbers: '', medicines: '', notes: '', nextVisitDate: '', amountCharged: '',
  });

  const fetchPatient = async () => {
    try {
      const res = await api.get(`/admin/patients/${id}`);
      const p = res.data.data.patient;
      setPatient(p);
      if (p.patientRecord) {
        setRecord({
          bloodGroup:       p.patientRecord.bloodGroup       || '',
          allergies:        p.patientRecord.allergies        || '',
          existingProblems: p.patientRecord.existingProblems || '',
          lastDentalVisit:  p.patientRecord.lastDentalVisit  || '',
          notes:            p.patientRecord.notes            || '',
        });
      }
    } catch { toast.error('Could not load patient'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPatient(); }, [id]);

  const saveRecord = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/patients/${id}/record`, record);
      toast.success('Record saved!');
      setEditingRecord(false);
      fetchPatient();
    } catch { toast.error('Could not save record'); }
    finally { setSaving(false); }
  };

  const resetVisitForm = () => setVisit({
    visitDate: new Date().toISOString().split('T')[0],
    treatment: '', toothNumbers: '', medicines: '', notes: '', nextVisitDate: '', amountCharged: '',
  });

  const openAddVisit = () => { resetVisitForm(); setEditingVisit(null); setShowVisitModal(true); };

  const openEditVisit = (v: Visit) => {
    setVisit({
      visitDate:     v.visitDate,
      treatment:     v.treatment,
      toothNumbers:  v.toothNumbers  || '',
      medicines:     v.medicines     || '',
      notes:         v.notes         || '',
      nextVisitDate: v.nextVisitDate || '',
      amountCharged: v.amountCharged?.toString() || '',
    });
    setEditingVisit(v);
    setShowVisitModal(true);
  };

  const submitVisit = async () => {
    if (!visit.treatment || !visit.visitDate) { toast.error('Visit date and treatment required'); return; }
    setSaving(true);
    try {
      if (editingVisit) {
        await api.patch(`/admin/patients/${id}/visits/${editingVisit.id}`, visit);
        toast.success('Visit updated!');
      } else {
        await api.post(`/admin/patients/${id}/visits`, visit);
        toast.success('Visit added!');
      }
      setShowVisitModal(false);
      fetchPatient();
    } catch { toast.error('Could not save visit'); }
    finally { setSaving(false); }
  };

  const deleteVisit = async (visitId: string) => {
    if (!confirm('Delete this visit record?')) return;
    try {
      await api.delete(`/admin/patients/${id}/visits/${visitId}`);
      toast.success('Visit deleted');
      fetchPatient();
    } catch { toast.error('Could not delete'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-8 h-8 animate-spin text-teal" />
    </div>
  );
  if (!patient) return <div className="text-center py-24 text-gray-400">Patient not found</div>;

  const visits = patient.patientRecord?.visits || [];

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-7">
        <button onClick={() => router.push('/admin/patients')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{patient.name}</h1>
          <p className="text-gray-400 text-sm">{patient.email} · Patient since {new Date(patient.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
        </div>
        <span className="bg-teal-light text-teal text-sm font-semibold px-3 py-1.5 rounded-lg">
          {patient._count.appointments} Appointments
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Medical Info</h2>
              <button onClick={() => setEditingRecord(!editingRecord)} className="text-teal hover:text-teal/70">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            {editingRecord ? (
              <div className="space-y-3">
                <div>
                  <label className="label">Blood Group</label>
                  <select value={record.bloodGroup} onChange={e => setRecord({...record, bloodGroup: e.target.value})} className="input-field text-sm">
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Allergies</label>
                  <input type="text" placeholder="e.g. Penicillin" value={record.allergies}
                    onChange={e => setRecord({...record, allergies: e.target.value})} className="input-field text-sm" />
                </div>
                <div>
                  <label className="label">Existing Dental Problems</label>
                  <textarea rows={2} value={record.existingProblems}
                    onChange={e => setRecord({...record, existingProblems: e.target.value})}
                    className="input-field text-sm resize-none" />
                </div>
                <div>
                  <label className="label">Last Dental Visit</label>
                  <input type="text" placeholder="e.g. Jan 2024" value={record.lastDentalVisit}
                    onChange={e => setRecord({...record, lastDentalVisit: e.target.value})} className="input-field text-sm" />
                </div>
                <div>
                  <label className="label">Notes</label>
                  <textarea rows={2} value={record.notes}
                    onChange={e => setRecord({...record, notes: e.target.value})}
                    className="input-field text-sm resize-none" />
                </div>
                <div className="flex gap-2">
                  <button onClick={saveRecord} disabled={saving} className="btn-teal flex-1 py-2 text-sm rounded-lg">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
                  </button>
                  <button onClick={() => setEditingRecord(false)} className="flex-1 py-2 text-sm border border-gray-200 rounded-lg text-gray-500">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Blood Group', value: record.bloodGroup || '—', highlight: true },
                  { label: 'Allergies', value: record.allergies || '—' },
                  { label: 'Existing Issues', value: record.existingProblems || '—' },
                  { label: 'Prior Visit', value: record.lastDentalVisit || '—' },
                  { label: 'Notes', value: record.notes || '—' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="text-xs text-gray-400 font-medium mb-0.5">{item.label}</div>
                    <div className={`text-sm ${item.highlight && record.bloodGroup ? 'font-bold text-red-500' : 'text-gray-700'}`}>{item.value}</div>
                  </div>
                ))}
                {!patient.patientRecord && (
                  <button onClick={() => setEditingRecord(true)}
                    className="w-full mt-2 py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-teal hover:text-teal transition-colors">
                    + Add Medical Info
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-4">Recent Bookings</h2>
            {patient.appointments.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-3">No appointments yet</p>
            ) : (
              <div className="space-y-2">
                {patient.appointments.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-gray-700">{a.service}</div>
                      <div className="text-xs text-gray-400">{a.date}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      a.status === 'CONFIRMED' ? 'bg-green-100 text-green-600' :
                      a.status === 'CANCELLED' ? 'bg-red-100 text-red-500' : 'bg-yellow-100 text-yellow-600'
                    }`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">
                Treatment History ({visits.length})
              </h2>
              <button onClick={openAddVisit} className="btn-teal px-4 py-2 text-sm rounded-lg flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add Visit
              </button>
            </div>

            {visits.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="font-medium text-gray-500">No visit records yet</p>
                <p className="text-sm mt-1">Click "Add Visit" to add the first treatment</p>
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
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {v.amountCharged && (
                              <span className="text-sm font-semibold text-teal flex items-center gap-0.5">
                                <IndianRupee className="w-3 h-3" />{v.amountCharged.toLocaleString('en-IN')}
                              </span>
                            )}
                            <button onClick={() => openEditVisit(v)} className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-teal ml-1">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteVisit(v.id)} className="p-1.5 rounded-lg hover:bg-white text-gray-400 hover:text-red-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          {v.toothNumbers && (
                            <div className="flex items-start gap-2">
                              <span className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 text-gray-500 font-medium mt-0.5 flex-shrink-0">Tooth</span>
                              <span className="text-gray-600">{v.toothNumbers}</span>
                            </div>
                          )}
                          {v.medicines && (
                            <div className="flex items-start gap-2">
                              <span className="text-xs bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5 text-blue-500 font-medium mt-0.5 flex-shrink-0 flex items-center gap-1">
                                <Pill className="w-2.5 h-2.5" /> Rx
                              </span>
                              <span className="text-gray-600">{v.medicines}</span>
                            </div>
                          )}
                          {v.notes && (
                            <div className="sm:col-span-2 flex items-start gap-2">
                              <span className="text-xs bg-yellow-50 border border-yellow-100 rounded px-1.5 py-0.5 text-yellow-600 font-medium mt-0.5 flex-shrink-0">Notes</span>
                              <span className="text-gray-600">{v.notes}</span>
                            </div>
                          )}
                          {v.nextVisitDate && (
                            <div className="sm:col-span-2 flex items-center gap-2 mt-1 pt-2 border-t border-gray-100">
                              <span className="text-xs text-green-600 font-medium">📅 Next visit:</span>
                              <span className="text-xs text-gray-500">{new Date(v.nextVisitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
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
      </div>

      {showVisitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">{editingVisit ? 'Edit Visit' : 'Add Visit Record'}</h3>
              <button onClick={() => setShowVisitModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Visit Date *</label>
                  <input type="date" value={visit.visitDate}
                    onChange={e => setVisit({...visit, visitDate: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="label">Amount (₹)</label>
                  <input type="number" placeholder="e.g. 1500" value={visit.amountCharged}
                    onChange={e => setVisit({...visit, amountCharged: e.target.value})} className="input-field" />
                </div>
              </div>
              <div>
                <label className="label">Treatment *</label>
                <select value={visit.treatment} onChange={e => setVisit({...visit, treatment: e.target.value})} className="input-field">
                  <option value="">Select treatment</option>
                  {TREATMENTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Tooth Number(s)</label>
                <input type="text" placeholder="e.g. 11, 12" value={visit.toothNumbers}
                  onChange={e => setVisit({...visit, toothNumbers: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="label">Medicines</label>
                <textarea rows={2} placeholder="e.g. Amoxicillin 500mg" value={visit.medicines}
                  onChange={e => setVisit({...visit, medicines: e.target.value})} className="input-field resize-none" />
              </div>
              <div>
                <label className="label">Doctor Notes</label>
                <textarea rows={2} placeholder="e.g. Follow up after 7 days" value={visit.notes}
                  onChange={e => setVisit({...visit, notes: e.target.value})} className="input-field resize-none" />
              </div>
              <div>
                <label className="label">Next Visit Date</label>
                <input type="date" value={visit.nextVisitDate}
                  onChange={e => setVisit({...visit, nextVisitDate: e.target.value})} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button onClick={submitVisit} disabled={saving} className="btn-teal flex-1 py-3 rounded-xl">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingVisit ? 'Update Visit' : 'Add Visit'}
              </button>
              <button onClick={() => setShowVisitModal(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-500 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}