'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Photo {
  id: string; url: string; title?: string; category: string;
}

interface GroupedPhotos {
  [key: string]: Photo[];
}

const CATEGORY_LABELS: Record<string, string> = {
  CLINIC:       '🏥 Clinic & Reception',
  DOCTOR:       '👨‍⚕️ Our Team',
  TREATMENT:    '🔧 Treatment Rooms',
  BEFORE_AFTER: '✨ Before & After',
  GALLERY:      '🖼️ Gallery',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ClinicGallery() {
  const [grouped, setGrouped]     = useState<GroupedPhotos>({});
  const [activeTab, setActiveTab] = useState('ALL');
  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [selected, setSelected]   = useState<Photo | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/photos`)
      .then(res => {
        setAllPhotos(res.data.data.photos);
        setGrouped(res.data.data.grouped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = Object.keys(grouped);
  const displayPhotos = activeTab === 'ALL' ? allPhotos : (grouped[activeTab] || []);

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (allPhotos.length === 0) return (
    <div className="text-center py-16 text-gray-400">
      <div className="text-4xl mb-2">📷</div>
      <p>Photos coming soon...</p>
    </div>
  );

  return (
    <div>
      {/* Category Filter Tabs */}
      {categories.length > 1 && (
        <div className="flex gap-2 flex-wrap justify-center mb-8">
          <button onClick={() => setActiveTab('ALL')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'ALL'
                ? 'bg-teal text-white shadow-md'
                : 'bg-white/20 text-white/80 hover:bg-white/30'
            }`}>
            All Photos
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === cat
                  ? 'bg-teal text-white shadow-md'
                  : 'bg-white/20 text-white/80 hover:bg-white/30'
              }`}>
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {displayPhotos.map((photo, i) => (
          <div key={photo.id}
            onClick={() => setSelected(photo)}
            className={`relative overflow-hidden rounded-xl cursor-pointer group ${
              i === 0 ? 'col-span-2 row-span-2' : ''
            }`}
            style={{ aspectRatio: i === 0 ? '1' : '1' }}>
            <img src={photo.url} alt={photo.title || 'Clinic photo'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              style={{ height: i === 0 ? '100%' : '200px' }} />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              {photo.title && (
                <span className="text-white text-sm font-medium">{photo.title}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelected(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-3xl font-light">
              ✕
            </button>
            <img src={selected.url} alt={selected.title || ''}
              className="w-full max-h-[80vh] object-contain rounded-xl" />
            {selected.title && (
              <p className="text-white text-center mt-3 font-medium">{selected.title}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
