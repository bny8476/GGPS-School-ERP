"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  X,
  CheckCheck,
  AlertCircle,
  Info,
  AlertTriangle,
  ArrowRight,
  Users,
  BookOpen,
  Calendar,
  FileSpreadsheet,
  Trash2,
  Check,
  Sparkles,
  Clock,
  ShieldCheck,
  Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getApiBaseUrl } from '@/lib/utils';
import { authFetch } from '@/lib/apiClient';

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  category: 'Urgent' | 'Parent' | 'Academic' | 'School' | 'General';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  link?: string;
  actionTab?: string;
  actionLabel?: string;
  createdAt: string;
}

export interface NotificationDrawerProps {
  onNavigateTab?: (tab: string) => void;
  badgeCount?: number;
}

// Fallback realistic notifications for Class LKG-A
const fallbackNotifications: NotificationItem[] = [
  {
    _id: 'notif-1',
    title: 'Medical Absence Notice: Diya Verma (Roll #04)',
    message: 'Diya Verma has been reported absent today due to mild seasonal flu. Parent attached prescription and requested homework forwarding.',
    type: 'Medical Alert',
    category: 'Urgent',
    priority: 'urgent',
    read: false,
    actionTab: 'PARENTS',
    actionLabel: 'View Parent Note',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    _id: 'notif-2',
    title: 'New Homework Submission: Aarav Sharma (Roll #01)',
    message: 'Parent uploaded workbook photo for "Tracing Letters A to E in Red Activity Workbook". Awaiting teacher verification & sticker.',
    type: 'Homework',
    category: 'Academic',
    priority: 'normal',
    read: false,
    actionTab: 'HOMEWORK',
    actionLabel: 'Review in Homework Hub',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    _id: 'notif-3',
    title: 'Morning Parent Inquiry: Ananya Patel (Roll #02)',
    message: 'Mother inquired: "Will the art studio activity require spare clothes today?" Please acknowledge message.',
    type: 'Parent Query',
    category: 'Parent',
    priority: 'high',
    read: false,
    actionTab: 'PARENTS',
    actionLabel: 'Reply to Parent',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString()
  },
  {
    _id: 'notif-4',
    title: 'Staff Council Meeting: Term 1 Department Review',
    message: 'Early Years Department review meeting scheduled for Thursday, 24 Sep at 03:00 PM in Conference Room B.',
    type: 'Official Circular',
    category: 'School',
    priority: 'normal',
    read: true,
    actionTab: 'HOME',
    actionLabel: 'View Circular',
    createdAt: new Date(Date.now() - 240 * 60 * 1000).toISOString()
  },
  {
    _id: 'notif-5',
    title: 'Term 1 English Phonics Marks Ledger Ready',
    message: 'Diagnostic evaluation papers for English Phonics are ready for score tabulation in the Exams & Marks console.',
    type: 'Examination',
    category: 'Academic',
    priority: 'normal',
    read: true,
    actionTab: 'EXAMS & MARKS',
    actionLabel: 'Open Gradebook Ledger',
    createdAt: new Date(Date.now() - 360 * 60 * 1000).toISOString()
  }
];

export default function NotificationDrawer({ onNavigateTab, badgeCount }: NotificationDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(fallbackNotifications);
  const [unreadCount, setUnreadCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'URGENT' | 'PARENT' | 'ACADEMIC' | 'SCHOOL'>('ALL');

  const fetchNotifications = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        return;
      }
      setLoading(true);
      const apiBase = getApiBaseUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`
      };

      let res = await authFetch(`${apiBase}/api/v1/notifications`, {
        headers,
        credentials: 'include',
        signal: controller.signal,
      }).catch(() => null);

      if (!res || res.status === 404) {
        res = await authFetch(`${apiBase}/api/notifications`, {
          headers,
          credentials: 'include',
          signal: controller.signal,
        }).catch(() => null);
      }

      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json();
        const list = data.notifications || data.data || [];
        if (list.length > 0) {
          setNotifications(list);
          const unread = data.unreadCount ?? list.filter((n: any) => !n.read).length;
          setUnreadCount(unread);
          localStorage.setItem('ggps_cached_notifications', JSON.stringify(list));
        }
      }
    } catch (e) {
      // Retain fallback data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);

    try {
      const cached = localStorage.getItem('ggps_cached_notifications');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotifications(parsed);
          setUnreadCount(parsed.filter((n: NotificationItem) => !n.read).length);
        } else {
          setNotifications(fallbackNotifications);
          setUnreadCount(fallbackNotifications.filter((n) => !n.read).length);
        }
      } else {
        setNotifications(fallbackNotifications);
        setUnreadCount(fallbackNotifications.filter((n) => !n.read).length);
      }
    } catch (e) {
      setNotifications(fallbackNotifications);
      setUnreadCount(fallbackNotifications.filter((n) => !n.read).length);
    }

    fetchNotifications();
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((item) => (item._id === id ? { ...item, read: true } : item));
      try {
        localStorage.setItem('ggps_cached_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setUnreadCount((c) => Math.max(0, c - 1));
    toast.success('Marked as read');
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((item) => ({ ...item, read: true }));
      try {
        localStorage.setItem('ggps_cached_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((item) => item._id !== id);
      try {
        localStorage.setItem('ggps_cached_notifications', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    toast.success('Notification dismissed');
  };

  const handleActionClick = (item: NotificationItem) => {
    handleMarkAsRead(item._id);
    setIsOpen(false);
    if (item.actionTab && onNavigateTab) {
      onNavigateTab(item.actionTab);
    }
  };

  // Filtered Notifications List
  const filteredNotifications = useMemo(() => {
    if (selectedCategory === 'ALL') return notifications;
    if (selectedCategory === 'URGENT') return notifications.filter((n) => n.priority === 'urgent' || n.category === 'Urgent');
    if (selectedCategory === 'PARENT') return notifications.filter((n) => n.category === 'Parent');
    if (selectedCategory === 'ACADEMIC') return notifications.filter((n) => n.category === 'Academic');
    if (selectedCategory === 'SCHOOL') return notifications.filter((n) => n.category === 'School');
    return notifications;
  }, [notifications, selectedCategory]);

  // Drawer JSX
  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
            className="relative z-10 w-full max-w-md sm:max-w-lg bg-white dark:bg-[#000E28] border-l border-slate-200 dark:border-slate-800 h-screen flex flex-col shadow-2xl overflow-hidden"
          >
            {/* 1. Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center font-bold shadow-xs">
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-slate-900 dark:text-white leading-none">
                      Notification Center
                    </h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF690C] text-white animate-pulse">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 block">
                    Class LKG-A • Live Faculty Dispatch
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-bold text-[#0050CB] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer py-1 px-2"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close notification drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* 2. Category Triage Pills */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#000E28] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
              {[
                { id: 'ALL', label: `All (${notifications.length})` },
                { id: 'URGENT', label: '🚨 Urgent' },
                { id: 'PARENT', label: '👨‍👩‍👧 Parents' },
                { id: 'ACADEMIC', label: '📚 Academic' },
                { id: 'SCHOOL', label: '📢 School' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === tab.id
                      ? 'bg-[#0050CB] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 3. Main Scrollable Content List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 custom-scrollbar">
              {loading && notifications.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-medium animate-pulse">
                  Syncing classroom notifications...
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-16 text-center text-slate-400 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#E5EEFF] text-[#0050CB] flex items-center justify-center mx-auto shadow-xs">
                    <CheckCheck className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 dark:text-white">
                    You're completely caught up!
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    No unread notifications in this category.
                  </p>
                </div>
              ) : (
                filteredNotifications.map((item) => {
                  const isUrgent = item.priority === 'urgent' || item.category === 'Urgent';

                  return (
                    <div
                      key={item._id}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                        !item.read
                          ? 'bg-[#E5EEFF]/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 shadow-xs'
                          : 'bg-white dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-800 opacity-90'
                      }`}
                    >
                      {/* Card Header: Type, Priority, Title */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isUrgent ? (
                            <span className="w-7 h-7 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0">
                              <AlertTriangle className="h-4 w-4" />
                            </span>
                          ) : item.category === 'Parent' ? (
                            <span className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center shrink-0">
                              <Users className="h-4 w-4" />
                            </span>
                          ) : (
                            <span className="w-7 h-7 rounded-xl bg-[#E5EEFF] dark:bg-blue-950 text-[#0050CB] flex items-center justify-center shrink-0">
                              <Info className="h-4 w-4" />
                            </span>
                          )}

                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                              {item.type}
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white leading-snug truncate">
                              {item.title}
                            </h4>
                          </div>
                        </div>

                        {!item.read && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0050CB] shrink-0 mt-1" title="Unread" />
                        )}
                      </div>

                      {/* Message Content */}
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {item.message}
                      </p>

                      {/* Card Footer: Timestamp & Action Buttons */}
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <div className="flex items-center gap-3">
                          {item.actionLabel && (
                            <button
                              type="button"
                              onClick={() => handleActionClick(item)}
                              className="font-bold text-[#0050CB] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>{item.actionLabel}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {!item.read && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(item._id)}
                              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                            >
                              Mark read
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDismissNotification(item._id)}
                            className="text-slate-400 hover:text-rose-500 cursor-pointer p-0.5"
                            title="Dismiss"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 4. Luxury Branded Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0050CB]" />
                <span>GGPS Faculty Real-Time Alert Dispatch</span>
              </div>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateTab('NOTIFICATIONS');
                  }}
                  className="font-bold text-[#0050CB] dark:text-blue-400 hover:underline text-xs cursor-pointer flex items-center gap-1"
                >
                  <span>Full Bulletin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const displayBadge = typeof badgeCount === 'number' ? badgeCount : unreadCount;

  return (
    <>
      {/* Trigger Bell Button in Header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative h-9 w-9 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-200/90 dark:border-slate-700 shadow-2xs"
        title="Notification Center"
      >
        <Bell className="h-4 w-4 text-slate-500 dark:text-slate-300" />
        {displayBadge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center pointer-events-none shadow-xs">
            {displayBadge > 9 ? '9+' : displayBadge}
          </span>
        )}
      </button>

      {/* Render via Portal to document.body to escape header backdrop-blur-md & h-16 container */}
      {mounted && typeof document !== 'undefined' && createPortal(drawerContent, document.body)}
    </>
  );
}
