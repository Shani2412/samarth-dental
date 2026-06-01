'use client';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard, Calendar, Star, Users,
  LogOut, Camera, FileText, ClipboardList,
} from 'lucide-react';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/admin',       icon: LayoutDashboard, label: 'Dashboard'     },
      { href: '/admin/reports', icon: FileText,       label: 'Reports'       },
    ],
  },
  {
    label: 'Patients',
    items: [
      { href: '/admin/patients',      icon: Users,          label: 'Patient Records' },
      { href: '/admin/appointments',  icon: Calendar,       label: 'Appointments'    },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/reviews', icon: Star,            label: 'Reviews'  },
      { href: '/admin/photos',  icon: Camera,          label: 'Photos'   },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth(true, true);
  const pathname = usePathname();
  const router   = useRouter();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-7 h-7 border-[3px] border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Sidebar ── */}
      <aside className="fixed top-0 left-0 bottom-0 w-56 bg-[#0B6E68] flex flex-col z-20 shadow-xl">
        {/* Brand */}
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Samarth Dental Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">Samarth Dental</div>
              <div className="text-white/50 text-[11px] mt-0.5">Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Admin info */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user.name}</div>
              <div className="text-white/45 text-[10px] truncate">{user.email}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {navGroups.map(group => (
            <div key={group.label} className="mb-1">
              <div className="px-4 py-1.5">
                <span className="text-[10px] font-bold text-white/35 uppercase tracking-widest">
                  {group.label}
                </span>
              </div>
              {group.items.map(({ href, icon: Icon, label }) => (
                <button
                  key={href}
                  onClick={() => router.push(href)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left ${
                    isActive(href)
                      ? 'bg-white/20 text-white'
                      : 'text-white/65 hover:text-white hover:bg-white/8'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-2.5 text-white/50 hover:text-white text-sm transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="ml-56 flex-1 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-3.5 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <a
            href="http://localhost:3000/website"
            target="_blank"
            className="text-xs text-teal hover:underline font-medium"
          >
            🌐 View Website →
          </a>
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}