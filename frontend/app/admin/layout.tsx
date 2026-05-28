'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Star, Users, LogOut, Camera, ClipboardList, BarChart2, Menu, X } from 'lucide-react';

const navItems = [
  { href: '/admin',              icon: LayoutDashboard, label: 'Dashboard'    },
  { href: '/admin/appointments', icon: Calendar,        label: 'Appointments' },
  { href: '/admin/reviews',      icon: Star,            label: 'Reviews'      },
  { href: '/admin/photos',       icon: Camera,          label: 'Photos'       },
  { href: '/admin/patients',     icon: ClipboardList,   label: 'Patients'     },
  { href: '/admin/reports',      icon: BarChart2,       label: 'Reports'      },
  { href: '/admin/users',        icon: Users,           label: 'Users'        },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth(true, true);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-white/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🦷</div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">Samarth Dental</div>
            <div className="text-white/50 text-xs">Vijapur, Mehsana</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="md:hidden text-white/60 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
          {user.name[0].toUpperCase()}
        </div>
        <div className="text-white font-semibold text-sm">{user.name}</div>
        <div className="text-white/55 text-xs truncate">{user.email}</div>
        <span className="inline-block mt-1.5 bg-gold/80 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
          👑 Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {navItems.map(({ href, icon: Icon, label }) => (
          <button key={href}
            onClick={() => { window.location.href = href; setOpen(false); }}
            className={`sidebar-link ${pathname === href ? 'active' : ''}`}>
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </nav>

      <div className="p-5 border-t border-white/10">
        <button onClick={logout} className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-60 bg-teal flex-col z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-72 max-w-[80vw] bg-teal flex flex-col z-40 h-full">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 md:ml-60 bg-gray-50 min-h-screen">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-teal sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🦷</span>
            <span className="text-white font-bold text-sm">Admin Panel</span>
          </div>
          <button onClick={() => setOpen(true)} className="text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
