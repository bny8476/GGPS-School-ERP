"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, CalendarHeart, UserCheck, WalletCards, 
  Settings, LogOut, Sun, Moon, Search, PanelLeftClose, 
  PanelLeft, Menu, X, ArrowLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import NotificationDrawer from '@/components/ui/NotificationDrawer';
import AcademyLogo from '@/components/AcademyLogo';

import { useAuthStore } from '@/stores/authStore';

function PortalLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user] = useState<any>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme, direction, setDirection } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      const role = (user.role || '').toLowerCase();
      if (role !== 'parent') {
        router.push('/dashboard');
      }
    }
  }, [router, user]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
      await fetch(`${apiBase}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.warn("Logout request failed:", e);
    } finally {
      useAuthStore.getState().logout();
    }
  };

  const initial = user?.firstName ? user.firstName[0].toUpperCase() : 'P';
  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Parent User';
  const roleStr = user?.role || 'Parent';

  const navItems = [
    { label: t('nav.portalOverview', 'Portal Overview'), href: '/portal', icon: LayoutDashboard },
    { label: t('nav.dailyDiary', 'Daily Diary'), href: '/portal/diary', icon: CalendarHeart },
    { label: t('nav.attendance', 'Attendance'), href: '/portal/attendance', icon: UserCheck },
    { label: t('nav.finance', 'Fees & Finance'), href: '/portal/finance', icon: WalletCards },
    { label: t('nav.portalSettings', 'Portal Settings'), href: '/portal/settings', icon: Settings },
  ];

  return (
    <div className={`flex h-screen bg-[#F8FAFC] dark:bg-[#000a1f] font-sans antialiased text-[#000E28] dark:text-white transition-colors duration-200 overflow-hidden ${direction === 'rtl' ? 'rtl' : 'ltr'}`}>
      
      {/* Desktop Sidebar (Matches Teacher Dashboard) */}
      <aside 
        className={`${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-white dark:bg-[#000E28] border-r border-slate-100 dark:border-slate-800 flex-col shrink-0 z-30 transition-all duration-300 hidden md:flex`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 sm:h-[70px] flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          {!isCollapsed ? (
            <Link href="/portal" className="flex items-center gap-2.5 overflow-hidden group">
              <AcademyLogo size="sm" />
              <div className="leading-tight">
                <span className="text-base font-black tracking-tight text-[#000E28] dark:text-white group-hover:text-[#0050CB] transition-colors">
                  GGPS <span className="text-[#0050CB]">School</span>
                </span>
                <span className="block text-[10px] text-[#FF690C] font-extrabold uppercase tracking-wider">
                  Parent Portal
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/portal" className="mx-auto" title="GGPS School">
              <AcademyLogo size="sm" />
            </Link>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* User Card inside Sidebar */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-2'} py-2 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60`}>
            <div className="relative shrink-0">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#0050CB] to-[#38BDF8] flex items-center justify-center text-white font-extrabold shadow-sm text-xs ring-2 ring-white dark:ring-[#000E28]">
                {initial}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#000E28]" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden leading-tight">
                <p className="text-xs font-extrabold text-[#000E28] dark:text-white truncate">
                  {userName}
                </p>
                <span className="text-[10px] text-[#0050CB] dark:text-[#38BDF8] font-bold uppercase tracking-wider">
                  {roleStr} Account
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3.5'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'} shrink-0 ${
                  isActive ? 'text-[#0050CB] dark:text-[#38BDF8]' : 'text-slate-400'
                }`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer: Back to Main Website & Sign Out */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1 shrink-0">
          <Link
            href="/"
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3.5'} py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer`}
            title={isCollapsed ? "Back to Website" : undefined}
          >
            <ArrowLeft className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'} text-slate-400 shrink-0`} />
            {!isCollapsed && <span>Main Website</span>}
          </Link>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3.5'} py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-colors cursor-pointer`}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <LogOut className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'} text-slate-400 hover:text-rose-600 shrink-0`} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-[#000E28] h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <Link href="/portal" className="flex items-center gap-2.5">
                <AcademyLogo size="sm" />
                <div className="leading-tight">
                  <span className="text-base font-black tracking-tight text-[#000E28] dark:text-white">
                    GGPS <span className="text-[#0050CB]">School</span>
                  </span>
                  <span className="block text-[10px] text-[#FF690C] font-extrabold uppercase">
                    Parent Portal
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#E5EEFF] dark:bg-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 mr-3 shrink-0 ${
                      isActive ? 'text-[#0050CB] dark:text-[#38BDF8]' : 'text-slate-400'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1 shrink-0">
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-3 text-rose-600 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Topbar Navigation (Matches Teacher Dashboard Layout) */}
        <header className="h-16 sm:h-[70px] bg-white/95 dark:bg-[#000E28]/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-20 transition-colors shadow-2xs">
          
          {/* Left: Hamburger (mobile) + Title & Live Badge */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block w-2.5 h-2.5 rounded-full bg-[#0050CB] ring-4 ring-[#0050CB]/15 shrink-0" />
                <h1 className="text-lg sm:text-[22px] font-extrabold text-[#000E28] dark:text-white tracking-tight truncate max-w-[220px] sm:max-w-none">
                  Parent &amp; Student Portal
                </h1>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5EEFF] dark:bg-[#0050CB]/20 border border-[#0050CB]/20 text-[#0050CB] dark:text-[#38BDF8] text-[11px] font-bold shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Active Portal</span>
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Trigger */}
            <div 
              onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true });
                window.dispatchEvent(event);
              }}
              className="hidden md:flex items-center justify-between w-[180px] lg:w-[210px] h-9 px-3 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 cursor-pointer transition-all border border-slate-200/70 dark:border-slate-700 focus-within:ring-2 focus-within:ring-[#0050CB]/30"
              title="Search portal (Ctrl+K)"
            >
              <div className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Search</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-600 shadow-2xs">
                Ctrl K
              </kbd>
            </div>

            {/* RTL / LTR Direction Toggle */}
            <button
              onClick={() => setDirection(direction === 'ltr' ? 'rtl' : 'ltr')}
              className="h-9 px-2.5 sm:px-3 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="Toggle Layout Direction (LTR/RTL)"
            >
              {direction.toUpperCase()}
            </button>

            {/* Notification Drawer */}
            <NotificationDrawer />

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="h-9 w-9 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700"
              title="Toggle Dark/Light Mode"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2.5 sm:pl-3 border-l border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 py-1 px-1.5 rounded-xl transition-colors cursor-pointer">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#0050CB] to-[#38BDF8] flex items-center justify-center text-white font-extrabold shadow-sm text-xs sm:text-sm ring-2 ring-white dark:ring-[#001438]">
                  {initial}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#000E28]" />
              </div>
              <div className="hidden lg:block text-left leading-tight pr-1">
                <p className="text-xs font-extrabold text-[#000E28] dark:text-white truncate max-w-[130px]">
                  {userName}
                </p>
                <p className="text-[10px] text-[#0050CB] dark:text-[#38BDF8] font-bold uppercase tracking-wider">
                  {roleStr}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Portal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-[#F7FAFE] via-white to-[#F6F9FE] dark:from-[#000a1f] dark:via-[#000E28] dark:to-[#000a1f] transition-colors flex flex-col justify-between">
          <div className="max-w-[1600px] w-full mx-auto space-y-6 sm:space-y-8">
            {children}
          </div>

          {/* Portal Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-200/80 dark:border-slate-800 max-w-[1600px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#000E28] dark:text-white">GGPS School</span>
              <span>&copy; {new Date().getFullYear()} Parent &amp; Student Portal. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync Connected
              </span>
              <span>•</span>
              <span>Support: contact@ggps.edu</span>
            </div>
          </footer>
        </div>

      </main>
    </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayoutContent>{children}</PortalLayoutContent>;
}
