'use client';
import { useAuth } from '@/hooks/useAuth';
import AppSidebar, { SidebarProvider, useSidebar, NavGroup } from '@/components/ui/AppSidebar';
import { Home, Calendar, ClipboardList, Star, Globe, History } from 'lucide-react';

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'My Clinic',
    items: [
      { href: '/dashboard',              icon: Home,          label: 'Home'            },
      { href: '/dashboard/book',         icon: Calendar,      label: 'Book Appointment'},
      { href: '/dashboard/appointments', icon: ClipboardList, label: 'My Appointments' },
    ],
  },
  {
    label: 'My Records',
    items: [
      { href: '/dashboard/history', icon: History, label: 'Treatment History' },
      { href: '/dashboard/review',  icon: Star,    label: 'Leave a Review'   },
    ],
  },
];

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();

  return (
    <div
      className={`flex-1 min-h-screen transition-all duration-300 ease-in-out
        ${open ? 'lg:ml-56' : 'lg:ml-[60px]'}`}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 lg:px-8 py-3
        flex items-center justify-between h-14">
        <div className="w-10 lg:w-0" />
        <p className="text-sm text-gray-400 hidden sm:block">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>
        <a
          href="/website"
          className="flex items-center gap-1.5 text-xs text-teal hover:underline font-medium"
        >
          <Globe className="w-3.5 h-3.5" />
          Visit Website
        </a>
      </div>

      {/* Page content */}
      <div className="p-4 lg:p-8">
        {children}
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth(true, false);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
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
          brandSub="Patient Portal"
        />
        <DashboardContent>{children}</DashboardContent>
      </div>
    </SidebarProvider>
  );
}