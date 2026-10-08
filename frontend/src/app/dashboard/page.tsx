"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { 
  Users, GraduationCap, Calendar, Wallet, UserCheck, 
  Clock, AlertTriangle, FileText, Image as ImageIcon, 
  ArrowRight, CheckCircle2, ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import TeacherWorkspace from '@/components/teacher/TeacherWorkspace';
import AdminExecutiveDashboard from '@/components/admin/AdminExecutiveDashboard';
import { authFetch } from '@/lib/apiClient';
import { getApiBaseUrl } from '@/lib/utils';

export default function DashboardOverview() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("Faculty Member");
  const [userRole, setUserRole] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchStats = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setIsLoading(false);
        return;
      }
      const apiBase = getApiBaseUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await authFetch(`${apiBase}/api/v1/dashboard/stats`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setStats(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('ggps_cached_stats', JSON.stringify(data));
        }
      }
    } catch (error) {
      console.warn('Dashboard stats sync notice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Instant optimistic state from localStorage cache for 0ms load
    const userStr = localStorage.getItem('user');
    let currentRole = '';
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setCurrentUser(parsed);
        if (parsed?.firstName) {
          setUserName(`${parsed.firstName} ${parsed.lastName || ''}`.trim());
        }
        currentRole = ((typeof parsed.role === 'string' ? parsed.role : parsed.role?.name) || '').toLowerCase();
        setUserRole(currentRole);
      } catch (e) {}
    }

    const cachedStatsStr = localStorage.getItem('ggps_cached_stats');
    if (cachedStatsStr) {
      try {
        const parsedStats = JSON.parse(cachedStatsStr);
        setStats(parsedStats);
        setIsLoading(false);
      } catch (e) {}
    } else if (currentRole === 'teacher') {
      // Teachers render instant workspace without waiting on network
      setIsLoading(false);
    }

    // 2. Background fresh fetch
    fetchStats();
  }, []);

  if (isLoading && !stats && userRole !== 'teacher') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#0050CB]/20 border-t-[#0050CB] animate-spin" />
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Loading Dashboard...</p>
      </div>
    );
  }

  // ==========================================
  // PARENT PORTAL UI
  // ==========================================
  if (stats?.isParentPortal) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        
        {/* Parent Portal Hero Banner */}
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#000E28] via-[#002772] to-[#0050CB] p-7 sm:p-10 border border-white/15 shadow-[0_20px_50px_rgba(0,14,40,0.15)] text-white">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          <div className="absolute -top-24 -right-20 w-80 h-80 bg-[#38BDF8]/30 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#38BDF8] text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
                <span>Parent Access Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Welcome, {userName}!
              </h1>
              <p className="text-blue-100/90 text-xs sm:text-sm max-w-xl leading-relaxed">
                Stay connected with your child's daily learning milestones, attendance records, and academic progress at GGPS School.
              </p>
            </div>

            <Link
              href="/admissions"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF690C] hover:bg-[#FF7E2E] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#FF690C]/30 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <span>{t('cta.apply', 'Apply for Admission')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {stats.error ? (
          <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 p-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-xs font-medium">
            {stats.error} Please contact the school administration to link your child to this account.
          </div>
        ) : (
          <>
            {/* My Children Overview Cards */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-4 rounded-full bg-[#0050CB]" />
                <h2 className="text-lg font-black text-[#000E28] dark:text-white tracking-tight">
                  Enrolled Students
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.myChildren?.map((child: any) => (
                  <div 
                    key={child._id} 
                    className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#000E28] via-[#002772] to-[#0050CB] p-6 text-white border border-white/10 shadow-[0_15px_35px_rgba(0,14,40,0.12)] group hover:scale-[1.02] transition-transform duration-300"
                  >
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#38BDF8]/20 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center space-x-4 relative z-10">
                      <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl font-black border-2 border-white/30 text-white shadow-inner">
                        {child.firstName[0]}
                      </div>
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] text-[10px] font-extrabold uppercase tracking-wider mb-1">
                          Class {child.className}
                        </span>
                        <h3 className="text-xl font-black text-white">{child.firstName} {child.lastName}</h3>
                        <p className="text-blue-100 text-xs font-medium">Section {child.section}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between items-end border-t border-white/15 pt-4 relative z-10">
                      <div>
                        <p className="text-[10px] text-blue-200 uppercase tracking-widest font-extrabold">Admission No.</p>
                        <p className="font-bold text-sm text-white tracking-wide">{child.admissionNumber}</p>
                      </div>
                      <div>
                        <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                          Active Student
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activities and Events Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left 2 Cols: Daily Activity & Gallery */}
              <div className="space-y-8 lg:col-span-2">
                
                {/* Daily Activity / Daycare */}
                <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#E5EEFF] dark:bg-[#0050CB]/25 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8]">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-[#000E28] dark:text-white tracking-tight">Recent Daily Activity</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Live check-ins, meals, and nap logs</p>
                      </div>
                    </div>
                  </div>

                  {stats.recentDaycareLogs?.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 italic text-xs">No recent activity logs found.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.recentDaycareLogs?.map((log: any) => (
                        <div key={log._id} className="bg-slate-50 dark:bg-[#000E28]/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 transition-colors">
                          <div className="flex justify-between items-center mb-2 border-b border-slate-200/60 dark:border-slate-800 pb-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                              {new Date(log.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </span>
                            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
                              In: {log.checkInTime || '-'} • Out: {log.checkOutTime || '-'}
                            </div>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                            {log.foodTracking && <p><span className="font-bold text-slate-400">Meal:</span> {log.foodTracking}</p>}
                            {log.sleepTracking && <p><span className="font-bold text-slate-400">Rest:</span> {log.sleepTracking}</p>}
                            {log.notes && <p><span className="font-bold text-slate-400">Notes:</span> {log.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Latest Gallery Albums */}
                <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#FFF3EB] dark:bg-[#FF690C]/20 flex items-center justify-center text-[#FF690C]">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-[#000E28] dark:text-white tracking-tight">Campus Gallery</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Recent classroom photos and events</p>
                      </div>
                    </div>
                  </div>

                  {stats.recentAlbums?.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 italic text-xs">No recent albums available.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {stats.recentAlbums?.map((album: any) => (
                        <div key={album._id} className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden group bg-slate-50 dark:bg-[#000E28]/60">
                          <div className="h-36 bg-slate-100 dark:bg-slate-800 relative">
                            {album.mediaUrls && album.mediaUrls.length > 0 ? (
                              <AppImage src={album.mediaUrls[0]} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ImageIcon className="h-8 w-8" />
                              </div>
                            )}
                          </div>
                          <div className="p-3.5">
                            <h4 className="font-bold text-xs sm:text-sm text-[#000E28] dark:text-white truncate">{album.title}</h4>
                            <p className="text-[11px] text-slate-400 font-medium mt-1">{new Date(album.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Col: Fees & Events */}
              <div className="space-y-8">
                
                {/* Fee Status Card */}
                <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-7">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-[#E5EEFF] dark:bg-[#0050CB]/25 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8]">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#000E28] dark:text-white tracking-tight">Fee Status</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Statements & reminders</p>
                    </div>
                  </div>

                  {stats.feesDue?.length === 0 ? (
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>All student tuition fees are fully cleared!</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.feesDue?.map((fee: any) => (
                        <div key={fee._id} className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                          <p className="font-bold text-xs text-[#000E28] dark:text-white">{fee.feeType}</p>
                          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mt-0.5">
                            Due: {new Date(fee.dueDate).toLocaleDateString()}
                          </p>
                          <div className="mt-3 flex justify-between items-center">
                            <p className="font-black text-[#000E28] dark:text-white text-base">
                              ₹{(fee.totalAmount - fee.amountPaid).toLocaleString()}
                            </p>
                            <Link
                              href="/dashboard/fees"
                              className="bg-[#0050CB] hover:bg-[#0041A8] text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all shadow-xs cursor-pointer inline-block"
                            >
                              Pay Now
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming Events */}
                <div className="bg-white/95 dark:bg-[#001438]/95 backdrop-blur-md rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-7">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-[#E5EEFF] dark:bg-[#0050CB]/25 flex items-center justify-center text-[#0050CB] dark:text-[#38BDF8]">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#000E28] dark:text-white tracking-tight">School Calendar</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Events & holidays</p>
                    </div>
                  </div>

                  {stats.upcomingEvents?.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 italic text-xs">No upcoming events scheduled.</p>
                  ) : (
                    <div className="space-y-3.5">
                      {stats.upcomingEvents?.map((event: any) => (
                        <div key={event._id} className="flex space-x-3.5 items-start">
                          <div className="flex flex-col items-center justify-center bg-[#E5EEFF] dark:bg-[#0050CB]/25 w-12 h-12 rounded-xl border border-blue-200/60 dark:border-[#0050CB]/40 shrink-0">
                            <span className="text-[10px] font-black text-[#0050CB] dark:text-[#38BDF8] uppercase">
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-base font-black text-[#000E28] dark:text-white leading-none">
                              {new Date(event.date).getDate()}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-xs text-[#000E28] dark:text-white leading-tight">{event.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{event.description || 'Campus Event'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          </>
        )}
      </div>
    );
  }

  // ==========================================
  // TEACHER ACADEMIC & CLASSROOM WORKSPACE
  // ==========================================
  if (userRole === 'teacher' || (stats?.isTeacherPortal && userRole !== 'admin' && userRole !== 'superadmin')) {
    return (
      <TeacherWorkspace 
        user={currentUser} 
        stats={stats} 
        onRefresh={fetchStats} 
      />
    );
  }

  // ==========================================
  // STAFF & ADMIN DASHBOARD UI
  // ==========================================
  return (
    <AdminExecutiveDashboard
      stats={stats}
      userName={userName}
      onRefresh={fetchStats}
    />
  );
}
