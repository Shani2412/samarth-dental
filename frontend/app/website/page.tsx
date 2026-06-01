'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser } from '@/lib/auth';
import api from '@/lib/api';

interface Review {
  id: string; name: string; location: string; stars: number; text: string;
}
interface Photo {
  id: string; url: string; title?: string; category: string;
}

const SERVICES = [
  { icon: '🦷', title: 'Teeth Cleaning',    desc: 'Professional scaling & polishing for a fresh, healthy smile.' },
  { icon: '✨', title: 'Teeth Whitening',   desc: 'Advanced whitening treatments for a brighter, confident smile.' },
  { icon: '🦴', title: 'Root Canal',        desc: 'Painless RCT using modern techniques to save your natural tooth.' },
  { icon: '👑', title: 'Dental Crown',      desc: 'Custom ceramic & zirconia crowns that look and feel natural.' },
  { icon: '🔧', title: 'Braces & Aligners', desc: 'Metal braces and clear aligners for perfectly aligned teeth.' },
  { icon: '🪥', title: 'Tooth Extraction',  desc: 'Safe, comfortable extractions including wisdom teeth removal.' },
  { icon: '🧩', title: 'Dental Implants',   desc: 'Permanent titanium implants for missing teeth — looks real.' },
  { icon: '🍼', title: 'Pediatric Dentistry', desc: 'Gentle, child-friendly dental care for kids of all ages.' },
];

const WHYS = [
  { icon: '🏆', title: '10+ Years Experience', desc: 'Trusted by thousands of patients across Mehsana district.' },
  { icon: '🔬', title: 'Modern Equipment',     desc: 'Digital X-rays, laser treatments & advanced sterilization.' },
  { icon: '💉', title: 'Painless Treatment',   desc: 'Gentle techniques & local anaesthesia for pain-free care.' },
  { icon: '📅', title: 'Flexible Timing',      desc: 'Morning & evening slots available for your convenience.' },
  { icon: '💰', title: 'Affordable Pricing',   desc: 'Transparent pricing with no hidden costs. EMI available.' },
  { icon: '🚗', title: 'Easy to Reach',        desc: 'On Vijapur–Himmatnagar Highway, near Anandpura Cross Road.' },
];

export default function WebsitePage() {
  const router = useRouter();
  const [reviews, setReviews]       = useState<Review[]>([]);
  const [photos, setPhotos]         = useState<Photo[]>([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [lightbox, setLightbox]     = useState<Photo | null>(null);
  const [dropdown, setDropdown]     = useState(false);

  const [user, setUser]   = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = getUser();
    const t = getToken();
    if (u && t) setUser(u);
  }, []);

  useEffect(() => {
    // Parallel fetch — faster than sequential
    Promise.allSettled([
      api.get('/reviews'),
      api.get('/photos'),
    ]).then(([reviewsRes, photosRes]) => {
      if (reviewsRes.status === 'fulfilled') setReviews(reviewsRes.value.data.data?.reviews || []);
      if (photosRes.status  === 'fulfilled') setPhotos(photosRes.value.data.data?.photos   || []);
    });
  }, []);

  const phone = process.env.NEXT_PUBLIC_CLINIC_PHONE || '919033142313';

  // mounted check handled inline per element

  // Smart action handler — used for Book & Review buttons
  const handleProtectedAction = (destination: string) => {
    if (user) {
      // Already logged in — go directly
      router.push(destination);
    } else {
      // Not logged in — go to login with redirect param
      router.push(`/login?redirect=${encodeURIComponent(destination)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sd_token');
    localStorage.removeItem('sd_user');
    document.cookie = 'sd_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setUser(null);
  };

  return (
    <div className="font-body bg-white text-gray-800">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-[68px] flex items-center justify-between">

          {/* Logo */}
          <a href="#" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-9 h-9 bg-teal rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-teal/90 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C9.5 2 7 4 7 7c0 1.5.5 3 1 4.5C8.5 13 9 15 9 17c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2 0-2 .5-4 1-5.5.5-1.5 1-3 1-4.5 0-3-2.5-5-5-5z"/>
              </svg>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-[15px] leading-tight">Samarth Dental Care</div>
              <div className="text-[11px] text-gray-400 leading-tight">Vijapur, Mehsana</div>
            </div>
          </a>

          {/* Desktop Nav Links — center */}
          <div className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
            {[
              { href: '#services', label: 'Services' },
              { href: '#why-us',   label: 'Why Us'   },
              ...(photos.length > 0 ? [{ href: '#gallery', label: 'Gallery' }] : []),
              { href: '#reviews',  label: 'Reviews'  },
              { href: '#contact',  label: 'Contact'  },
            ].map(link => (
              <a key={link.href} href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Auth — right */}
          <div className="hidden md:flex items-center gap-2.5 flex-shrink-0">
            {!mounted ? (
              <div className="w-24 h-8 bg-gray-100 rounded-lg animate-pulse" />
            ) : user ? (
              <div className="relative">
                {/* Avatar button */}
                <button
                  onClick={() => setDropdown(!dropdown)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
                >
                  <div className="w-8 h-8 bg-teal rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user.name[0].toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-800 leading-tight">{user.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-gray-400 leading-tight">{user.role === 'ADMIN' ? 'Administrator' : 'Patient'}</div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${dropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {/* Dropdown */}
                {dropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdown(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden">
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-gray-50">
                        <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                        <div className="text-xs text-gray-400 truncate">{user.email || (user.role === 'ADMIN' ? 'Administrator' : 'Patient')}</div>
                      </div>
                      {/* Dashboard */}
                      <button
                        onClick={() => { setDropdown(false); router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard'); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <svg className="w-4 h-4 text-teal" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                          <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
                        </svg>
                        {user.role === 'ADMIN' ? 'Admin Panel' : 'My Dashboard'}
                      </button>
                      {/* Book (only for patients) */}
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => { setDropdown(false); router.push('/dashboard/book'); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                        >
                          <svg className="w-4 h-4 text-teal" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                          </svg>
                          Book Appointment
                        </button>
                      )}
                      {/* Divider */}
                      <div className="my-1.5 border-t border-gray-50" />
                      {/* Logout */}
                      <button
                        onClick={() => { setDropdown(false); handleLogout(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                        </svg>
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => router.push('/login')}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-teal hover:bg-gray-50 rounded-lg transition-all">
                  Login
                </button>
                <button onClick={() => router.push('/signup')}
                  className="px-4 py-2 bg-teal text-white text-sm font-semibold rounded-xl hover:bg-teal/90 transition-colors shadow-sm shadow-teal/20">
                  Book Appointment
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3">
            {/* User info if logged in */}
            {user && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-3">
                <div className="w-9 h-9 bg-teal rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                  <div className="text-xs text-gray-400">{user.role === 'ADMIN' ? 'Administrator' : 'Patient'}</div>
                </div>
              </div>
            )}
            <div className="space-y-0.5 mb-3">
              {[
                { href: '#services', label: 'Services' },
                { href: '#why-us',   label: 'Why Us'   },
                { href: '#reviews',  label: 'Reviews'  },
                { href: '#contact',  label: 'Contact'  },
              ].map(link => (
                <a key={link.href} href={link.href} onClick={() => setMobileMenu(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-teal hover:bg-gray-50 rounded-lg transition-all">
                  {link.label}
                </a>
              ))}
            </div>
            <div className="space-y-2 pt-3 border-t border-gray-100">
              {user ? (
                <>
                  <button onClick={() => { setMobileMenu(false); router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard'); }}
                    className="w-full py-2.5 bg-teal text-white text-sm font-semibold rounded-xl">
                    {user.role === 'ADMIN' ? 'Admin Panel' : 'My Dashboard'}
                  </button>
                  <button onClick={() => { setMobileMenu(false); handleLogout(); }}
                    className="w-full py-2.5 text-sm font-semibold text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setMobileMenu(false); router.push('/login'); }}
                    className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 text-gray-600 rounded-xl">Login</button>
                  <button onClick={() => { setMobileMenu(false); router.push('/signup'); }}
                    className="flex-1 py-2.5 text-sm font-semibold bg-teal text-white rounded-xl">Sign Up</button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-teal-light via-white to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal-light text-teal text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <span>⭐</span> Dr. Vrujeshkumar Patel (B.D.S.) — Vijapur
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-bold leading-tight mb-5">
              Your Smile,<br /><span className="text-teal">Our Priority</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
              Experience world-class dental care at Samarth Dental Care. Gentle treatments, modern technology, and a smile you&apos;ll love.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => handleProtectedAction('/dashboard/book')}
                className="btn-primary text-sm px-6 py-3.5">
                📅 Book Appointment
              </button>
              <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer"
                className="btn-outline text-sm px-6 py-3.5">
                💬 WhatsApp Us
              </a>
            </div>
            <div className="flex items-center gap-6 mt-10 pt-6 border-t border-gray-100">
              {[['500+','Happy Patients'],['10+','Years Experience'],['4.9★','Rating']].map(([val, label]) => (
                <div key={label}>
                  <div className="font-display text-2xl font-bold text-teal">{val}</div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-72 h-72 bg-teal rounded-full flex items-center justify-center shadow-2xl shadow-teal/30">
              <span className="text-9xl">🦷</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <div className="text-teal text-sm font-semibold tracking-widest uppercase mb-2">What We Offer</div>
            <h2 className="font-display text-4xl font-bold mb-3">Our Dental Services</h2>
            <p className="text-gray-400 max-w-md mx-auto">Comprehensive dental care for the whole family.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map(s => (
              <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group border border-gray-50">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="font-semibold text-gray-800 mb-2 group-hover:text-teal transition-colors">{s.title}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={() => handleProtectedAction('/dashboard/book')}
              className="btn-primary text-sm px-8 py-3.5">
              Book a Service →
            </button>
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section id="why-us" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <div className="text-teal text-sm font-semibold tracking-widest uppercase mb-2">Our Promise</div>
            <h2 className="font-display text-4xl font-bold mb-3">Why Choose Samarth Dental?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHYS.map(w => (
              <div key={w.title} className="flex gap-4 p-5 rounded-2xl hover:bg-teal-light transition-colors">
                <div className="w-12 h-12 bg-teal-light rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{w.icon}</div>
                <div>
                  <div className="font-semibold text-gray-800 mb-1">{w.title}</div>
                  <div className="text-sm text-gray-400 leading-relaxed">{w.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      {photos.length > 0 && (
        <section id="gallery" className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-12">
              <div className="text-teal text-sm font-semibold tracking-widest uppercase mb-2">Our Clinic</div>
              <h2 className="font-display text-4xl font-bold mb-3">Clinic Gallery</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {photos.map((photo, i) => (
                <div key={photo.id} onClick={() => setLightbox(photo)}
                  className={`relative overflow-hidden rounded-2xl cursor-pointer group ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
                  style={{ height: i === 0 ? '420px' : '200px' }}>
                  <img src={photo.url} alt={photo.title || 'Clinic'} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    {photo.title && <span className="text-white text-sm font-medium">{photo.title}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)} className="absolute -top-10 right-0 text-white/70 hover:text-white text-3xl">✕</button>
            <img src={lightbox.url} alt={lightbox.title || ''} className="w-full max-h-[80vh] object-contain rounded-xl" />
            {lightbox.title && <p className="text-white text-center mt-3 font-medium">{lightbox.title}</p>}
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <section className="py-16 bg-gold-light">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="font-display text-4xl font-bold text-gray-800 mb-3">Ready for a Healthier Smile?</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Book your appointment online in seconds.</p>
          <button onClick={() => handleProtectedAction('/dashboard/book')}
            className="btn-primary text-base px-10 py-4">
            Book Appointment Now →
          </button>
        </div>
      </section>

      {/* ── CONTACT + MAP ── */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <div className="text-teal text-sm font-semibold tracking-widest uppercase mb-2">Get in Touch</div>
            <h2 className="font-display text-4xl font-bold mb-3">Find Us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
            {[
              { icon: '📍', title: 'Address', lines: ['20/24 Dev Complex', 'Anandpura Char Rasta', 'Vijapur, Gujarat – 384570'] },
              { icon: '📞', title: 'Phone',   lines: ['+91 90331 42313', 'Morning: 6am – 2pm', 'Evening: 6pm – 9pm'] },
              { icon: '📧', title: 'Email',   lines: ['virupatel2794@gmail.com', 'We reply within 2 hours', 'Or WhatsApp us anytime'] },
            ].map(c => (
              <div key={c.title} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-teal-light transition-colors">
                <div className="text-4xl mb-3">{c.icon}</div>
                <div className="font-semibold text-gray-800 mb-2">{c.title}</div>
                {c.lines.map(l => <div key={l} className="text-sm text-gray-400 leading-relaxed">{l}</div>)}
              </div>
            ))}
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
            <div className="bg-teal-light px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🗺️</span>
                <div>
                  <div className="font-semibold text-teal text-sm">Samarth Dental Clinic</div>
                  <div className="text-xs text-gray-500">20/24 Dev Complex, Anandpura Char Rasta, Vijapur 384570</div>
                </div>
              </div>
              <a href="https://www.google.com/maps/search/20+21+Dev+Complex+Vijapur+Himmatnagar+Highway+near+Anandpura+Vijapur+Gujarat+384570"
                target="_blank" rel="noopener noreferrer"
                className="flex-shrink-0 bg-teal text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                Open in Maps ↗
              </a>
            </div>
            <iframe title="Samarth Dental Care Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3667.0!2d72.7567!3d23.5387!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMyJzE5LjMiTiA3MsKwNDUnMjQuMSJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin&q=20/21+Dev+Complex,+Vijapur+Himmatnagar+Highway,+near+Anandpura,+Vijapur,+Gujarat+384570"
              width="100%" height="420" style={{ border: 0, display: 'block' }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <div className="bg-gray-50 px-6 py-4 flex flex-wrap gap-3 items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500"><span>🚗</span><span>20/24 Dev Complex, Anandpura Char Rasta, Vijapur</span></div>
              <div className="flex gap-2">
                <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">💬 WhatsApp</a>
                <a href="https://www.google.com/maps/dir/?api=1&destination=20+21+Dev+Complex+Vijapur+Himmatnagar+Highway+Anandpura+Vijapur+Gujarat+384570"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-teal text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">🧭 Get Directions</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section id="reviews" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-light text-teal text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              ⭐ Patient Reviews
            </div>
            <h2 className="font-display text-4xl font-bold text-gray-900 mb-3">What Our Patients Say</h2>
            <p className="text-gray-400 max-w-md mx-auto text-sm">Real experiences from our patients — honest and unfiltered.</p>
          </div>

          {reviews.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-teal-light rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">No reviews yet</h3>
              <p className="text-gray-400 text-sm mb-6">Be the first to share your experience with us!</p>
              <button onClick={() => handleProtectedAction('/dashboard/review')}
                className="px-6 py-2.5 bg-teal text-white text-sm font-semibold rounded-lg hover:bg-teal/90 transition-colors">
                Write a Review
              </button>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {reviews.slice(0, 6).map(r => {
                  const colors = ['#0B6E68','#C9A84C','#6B7280','#0B6E68','#C9A84C','#6B7280'];
                  const bg = colors[r.name.charCodeAt(0) % 6];
                  return (
                    <div key={r.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                      {/* Stars */}
                      <div className="flex gap-0.5 mb-4">
                        {Array.from({length:5}).map((_,i) => (
                          <span key={i} style={{ color: i < r.stars ? '#F59E0B' : '#E5E7EB', fontSize: '16px' }}>★</span>
                        ))}
                      </div>
                      {/* Text */}
                      <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5">&ldquo;{r.text}&rdquo;</p>
                      {/* Author */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                          style={{ background: bg }}>
                          {r.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 text-sm">{r.name}</div>
                          <div className="text-gray-400 text-xs">📍 {r.location}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center">
                <button onClick={() => handleProtectedAction('/dashboard/review')}
                  className="px-8 py-3 bg-teal text-white text-sm font-semibold rounded-lg hover:bg-teal/90 transition-colors">
                  ⭐ Share Your Experience
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🦷</span>
              <div>
                <div className="font-display text-lg font-bold">Samarth Dental Care</div>
                <div className="text-white/40 text-xs">Vijapur, Mehsana, Gujarat</div>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-white/50">
              {user ? (
                <button onClick={() => router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard')} className="hover:text-white transition-colors">Dashboard</button>
              ) : (
                <button onClick={() => router.push('/login')} className="hover:text-white transition-colors">Login</button>
              )}
              <button onClick={() => handleProtectedAction('/dashboard/book')} className="hover:text-white transition-colors">Book</button>
              <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">WhatsApp</a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 text-center text-white/30 text-xs">
            © 2025 Samarth Dental Care. All rights reserved. Vijapur, Mehsana, Gujarat.
          </div>
        </div>
      </footer>
    </div>
  );
}
