'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Upload, Trash2, Loader2, ImagePlus } from 'lucide-react';

interface Photo {
  id: string; url: string; filename: string;
  category: string; title: string; description: string;
  order: number; createdAt: string;
}

const CATEGORIES = [
  { value: 'CLINIC',       label: '🏥 Clinic Building/Reception' },
  { value: 'DOCTOR',       label: '👨‍⚕️ Doctor & Staff' },
  { value: 'TREATMENT',    label: '🔧 Treatment Room' },
  { value: 'BEFORE_AFTER', label: '✨ Before / After' },
  { value: 'GALLERY',      label: '🖼️ General Gallery' },
];

export default function AdminPhotos() {
  useAuth(true, true);
  const [photos, setPhotos]         = useState<Photo[]>([]);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const [activeTab, setActiveTab]   = useState('ALL');
  const [dragOver, setDragOver]     = useState(false);
  const [preview, setPreview]       = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState({ category: 'GALLERY', title: '', description: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadPhotos(); }, []);

  async function loadPhotos() {
    try {
      setLoading(true);
      const res = await api.get('/admin/photos');
      setPhotos(res.data.data.photos);
    } catch { toast.error('Could not load photos'); }
    finally { setLoading(false); }
  }

  function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('Only image files allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File too large. Max 5MB'); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  async function handleUpload() {
    if (!selectedFile) { toast.error('Please select a photo first'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('category', form.category);
      formData.append('title', form.title);
      formData.append('description', form.description);

      await api.post('/admin/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('✅ Photo uploaded successfully!');
      setSelectedFile(null);
      setPreview(null);
      setForm({ category: 'GALLERY', title: '', description: '' });
      loadPhotos();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  }

  async function deletePhoto(id: string) {
    if (!confirm('Delete this photo permanently?')) return;
    try {
      await api.delete(`/admin/photos/${id}`);
      toast.success('🗑️ Photo deleted');
      loadPhotos();
    } catch { toast.error('Delete failed'); }
  }

  const filtered = activeTab === 'ALL' ? photos : photos.filter(p => p.category === activeTab);

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-800">Photos 📸</h1>
        <p className="text-gray-500 text-sm mt-1">Upload and manage clinic photos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upload Panel */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-8">
            <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <ImagePlus className="w-5 h-5 text-teal" /> Upload New Photo
            </h2>

            {/* Drop Zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-4 ${
                dragOver ? 'border-teal bg-teal-light' : 'border-gray-200 hover:border-teal hover:bg-gray-50'
              }`}>
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                  <div className="mt-2 text-xs text-gray-500">{selectedFile?.name}</div>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Drop photo here</p>
                  <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                  <p className="text-xs text-gray-300 mt-2">JPG, PNG, WEBP • Max 5MB</p>
                </>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />

            {/* Category */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category *</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Title */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Title (Optional)</label>
              <input type="text" placeholder="e.g. Reception Area"
                value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal" />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description (Optional)</label>
              <textarea rows={2} placeholder="Short description..."
                value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal resize-none" />
            </div>

            <button onClick={handleUpload} disabled={uploading || !selectedFile}
              className="btn-teal w-full py-3 rounded-xl">
              {uploading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                : <><Upload className="w-4 h-4" /> Upload Photo</>
              }
            </button>

            {selectedFile && (
              <button onClick={() => { setSelectedFile(null); setPreview(null); }}
                className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Clear selection
              </button>
            )}
          </div>
        </div>

        {/* Photos Grid */}
        <div className="lg:col-span-2">
          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap mb-4">
            <button onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                activeTab === 'ALL' ? 'bg-teal text-white border-teal' : 'bg-white text-gray-500 border-gray-200 hover:border-teal'
              }`}>
              All ({photos.length})
            </button>
            {CATEGORIES.map(c => {
              const count = photos.filter(p => p.category === c.value).length;
              return (
                <button key={c.value} onClick={() => setActiveTab(c.value)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    activeTab === c.value ? 'bg-teal text-white border-teal' : 'bg-white text-gray-500 border-gray-200 hover:border-teal'
                  }`}>
                  {c.label.split(' ').slice(1).join(' ')} ({count})
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-teal" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card p-16 text-center text-gray-400">
              <div className="text-5xl mb-3">📷</div>
              <p className="text-lg font-medium">No photos yet</p>
              <p className="text-sm mt-1">Upload your first photo using the panel on the left</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filtered.map(photo => (
                <div key={photo.id} className="card group relative overflow-hidden">
                  <div className="aspect-square">
                    <img src={photo.url} alt={photo.title || photo.category}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <div className="flex justify-end">
                      <button onClick={() => deletePhoto(photo.id)}
                        className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      {photo.title && <p className="text-white text-sm font-semibold truncate">{photo.title}</p>}
                      <span className="inline-block bg-teal/80 text-white text-xs px-2 py-0.5 rounded-full mt-1">
                        {CATEGORIES.find(c => c.value === photo.category)?.label.split(' ').slice(1).join(' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
