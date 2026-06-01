'use client';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Home, Calendar, ClipboardList, Star, LogOut, Globe } from 'lucide-react';

const navItems = [
  { href: '/dashboard',             icon: Home,          label: 'Home' },
  { href: '/dashboard/book',        icon: Calendar,      label: 'Book Appointment' },
  { href: '/dashboard/appointments',icon: ClipboardList, label: 'My Appointments' },
  { href: '/dashboard/review',      icon: Star,          label: 'Leave a Review' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth(true, false);
  const pathname = usePathname();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 w-60 bg-teal flex flex-col z-10">
        <div className="p-5 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Samarth Dental"
                width={44}
                height={44}
                className="object-contain"
              />
            </div>
            <div>
              <div className="text-white font-bold text-base">Samarth Dental</div>
              <div className="text-white/50 text-xs">Vijapur, Mehsana</div>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
            {user.name[0].toUpperCase()}
          </div>
          <div className="text-white font-semibold text-sm">{user.name}</div>
          <div className="text-white/55 text-xs truncate">{user.email}</div>
          <span className="inline-block mt-1.5 bg-white/20 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
            👤 Patient
          </span>
        </div>

        <nav className="flex-1 py-3">
          {navItems.map(({ href, icon: Icon, label }) => (
            <button key={href} onClick={() => window.location.href = href}
              className={`sidebar-link ${pathname === href ? 'active' : ''}`}>
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-5 border-t border-white/10 space-y-2">
          <a href="/website" className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
            <Globe className="w-4 h-4" />
            Visit Website
          </a>
          <button onClick={logout} className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-60 flex-1 bg-gray-50 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
}