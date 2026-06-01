'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

// ── Sidebar Context ──
interface SidebarCtx {
  open:   boolean;
  toggle: () => void;
  close:  () => void;
}
const SidebarContext = createContext<SidebarCtx>({ open: true, toggle: () => {}, close: () => {} });
export const useSidebar = () => useContext(SidebarContext);

// ── Nav Item type ──
export interface NavItem {
  href:  string;
  icon:  React.ElementType;
  label: string;
}
export interface NavGroup {
  label: string;
  items: NavItem[];
}

interface AppSidebarProps {
  groups:    NavGroup[];
  user:      { name: string; email: string; role: string } | null;
  onLogout:  () => void;
  brandTitle: string;
  brandSub:  string;
  exactMatch?: boolean; // for routes like /admin that shouldn't match /admin/xxx
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('sd_sidebar');
    return saved !== null ? saved === 'true' : true;
  });

  const toggle = () => setOpen(prev => {
    const next = !prev;
    localStorage.setItem('sd_sidebar', String(next));
    return next;
  });

  const close = () => {
    setOpen(false);
    localStorage.setItem('sd_sidebar', 'false');
  };

  return (
    <SidebarContext.Provider value={{ open, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export default function AppSidebar({
  groups, user, onLogout, brandTitle, brandSub, exactMatch = false
}: AppSidebarProps) {
  const { open, toggle, close } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Close mobile on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const isActive = (href: string) => {
    if (exactMatch && href === pathname.split('/').slice(0, 3).join('/')) {
      return pathname === href;
    }
    return href === '/admin' || href === '/dashboard'
      ? pathname === href
      : pathname.startsWith(href);
  };

  const navTo = (href: string) => {
    router.push(href);
    setMobileOpen(false);
  };

  // ── Sidebar inner content (shared desktop + mobile) ──
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`flex items-center border-b border-white/10 flex-shrink-0 ${
        !isMobile && !open ? 'px-3 py-4 justify-center' : 'px-4 py-4 gap-3'
      }`}>
        <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
          <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-contain" />
        </div>
        {(isMobile || open) && (
          <div className="min-w-0">
            <div className="text-white font-bold text-sm leading-tight truncate">{brandTitle}</div>
            <div className="text-white/50 text-[11px] truncate">{brandSub}</div>
          </div>
        )}
      </div>

      {/* User info */}
      {user && (
        <div className={`border-b border-white/10 flex-shrink-0 ${
          !isMobile && !open ? 'px-3 py-3 flex justify-center' : 'px-4 py-3 flex items-center gap-2.5'
        }`}>
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user.name[0].toUpperCase()}
          </div>
          {(isMobile || open) && (
            <div className="min-w-0">
              <div className="text-white text-xs font-semibold truncate">{user.name}</div>
              <div className="text-white/45 text-[10px] truncate">{user.email}</div>
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
        {groups.map(group => (
          <div key={group.label} className="mb-1">
            {/* Group label — only when open */}
            {(isMobile || open) && (
              <div className="px-4 pt-3 pb-1">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  {group.label}
                </span>
              </div>
            )}
            {!isMobile && !open && <div className="my-1 mx-3 h-px bg-white/10" />}

            {group.items.map(({ href, icon: Icon, label }) => {
              const active = isActive(href);
              return (
                <button
                  key={href}
                  onClick={() => navTo(href)}
                  title={!isMobile && !open ? label : undefined}
                  className={`w-full flex items-center transition-colors text-left relative group
                    ${!isMobile && !open
                      ? 'justify-center px-0 py-2.5'
                      : 'gap-3 px-4 py-2.5'
                    }
                    ${active
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {(isMobile || open) && (
                    <span className="text-sm font-medium truncate">{label}</span>
                  )}
                  {active && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-l-full" />
                  )}
                  {/* Tooltip when collapsed */}
                  {!isMobile && !open && (
                    <span className="absolute left-full ml-2 px-2.5 py-1 bg-gray-800 text-white text-xs rounded-lg
                      opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                      {label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className={`border-t border-white/10 flex-shrink-0 ${
        !isMobile && !open ? 'px-3 py-3 flex justify-center' : 'px-4 py-3'
      }`}>
        <button
          onClick={onLogout}
          title={!isMobile && !open ? 'Sign Out' : undefined}
          className={`flex items-center text-white/50 hover:text-white transition-colors group relative
            ${!isMobile && !open ? '' : 'gap-2.5'}`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(isMobile || open) && <span className="text-sm">Sign Out</span>}
          {!isMobile && !open && (
            <span className="absolute left-full ml-2 px-2.5 py-1 bg-gray-800 text-white text-xs rounded-lg
              opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
              Sign Out
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 bottom-0 bg-[#0B6E68] z-20
          transition-all duration-300 ease-in-out shadow-xl
          ${open ? 'w-56' : 'w-[60px]'}`}
      >
        <SidebarContent />

        {/* Toggle button */}
        <button
          onClick={toggle}
          className="absolute -right-3 top-16 w-6 h-6 bg-white border border-gray-200 rounded-full
            flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors z-30"
          title={open ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {open
            ? <ChevronLeft  className="w-3.5 h-3.5 text-gray-500" />
            : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          }
        </button>
      </aside>

      {/* ── MOBILE: Hamburger button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-30 w-9 h-9 bg-[#0B6E68] text-white
          rounded-lg flex items-center justify-center shadow-md"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ── MOBILE: Backdrop ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── MOBILE: Drawer ── */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-[#0B6E68] z-50
          transition-transform duration-300 ease-in-out shadow-2xl
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 bg-white/10 text-white rounded-lg
            flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent isMobile />
      </aside>
    </>
  );
}