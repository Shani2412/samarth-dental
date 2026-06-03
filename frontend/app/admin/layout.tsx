'use client';
import { useAuth } from '@/hooks/useAuth';
import AppSidebar, { SidebarProvider, useSidebar, NavGroup } from '@/components/ui/AppSidebar';
import {
  LayoutDashboard, Calendar, Star,
  Users, Camera, FileText,
} from 'lucide-react';

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { href: '/admin',         icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/admin/reports', icon: FileText,        label: 'Reports'   },
    ],
  },
  {
    label: 'Patients',
    items: [
      { href: '/admin/patients',     icon: Users,    label: 'Patient Records' },
      { href: '/admin/appointments', icon: Calendar, label: 'Appointments'    },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/reviews', icon: Star,   label: 'Reviews' },
      { href: '/admin/photos',  icon: Camera, label: 'Photos'  },
    ],
  },
];

function AdminContent({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();

  return (
    <div
      className={`flex-1 min-h-screen transition-all duration-300 ease-in-out
        ${open ? 'lg:ml-56' : 'lg:ml-[60px]'}`}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 lg:px-8 py-3
        flex items-center justify-between h-14">
        {/* Spacer for mobile hamburger */}
        <div className="w-10 lg:w-0" />
        <p className="text-sm text-gray-400 hidden sm:block">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>
        <a
          href="https://www.samarthdentalcare.in"
          className="text-xs text-teal hover:underline font-medium"
        >
          🌐 View Website →
        </a>
      </div>

      {/* Page content */}
      <div className="p-4 lg:p-8">
        {children}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth(true, true);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-7 h-7 border-[3px] border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <AppSidebar
          groups={NAV_GROUPS}
          user={user}
          onLogout={logout}
          brandTitle="Samarth Dental"
          brandSub="Admin Panel"
        />
        <AdminContent>{children}</AdminContent>
      </div>
    </SidebarProvider>
  );
}