"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/apiClient';
import { 
  Search, 
  Users, 
  GraduationCap, 
  DollarSign, 
  BookOpen, 
  Calendar, 
  Settings, 
  FileText, 
  CheckSquare, 
  X, 
  Sparkles, 
  PlusCircle, 
  FilePlus, 
  ArrowRight,
  Package,
  ShieldCheck,
  Megaphone,
  BarChart3,
  Receipt,
  UserCheck,
  Briefcase
} from 'lucide-react';

interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Quick Actions' | 'Students' | 'Admissions' | 'Finance' | 'Modules' | 'Operations';
  href: string;
  icon: any;
}

const GLOBAL_SEARCH_ITEMS: SearchItem[] = [
  // Quick Actions
  { id: 'qa-1', title: 'Add New Student', subtitle: 'Enroll a new student record', category: 'Quick Actions', href: '/dashboard/students?action=new', icon: PlusCircle },
  { id: 'qa-2', title: 'New Admission Inquiry', subtitle: 'Log parent phone/walk-in inquiry', category: 'Quick Actions', href: '/dashboard/admissions?action=new', icon: Sparkles },
  { id: 'qa-3', title: 'Collect Fee Payment', subtitle: 'Record offline or online receipt', category: 'Quick Actions', href: '/dashboard/fees?action=collect', icon: DollarSign },
  { id: 'qa-4', title: 'Mark Daily Attendance', subtitle: 'Biometric & manual roll-call', category: 'Quick Actions', href: '/dashboard/attendance', icon: UserCheck },
  { id: 'qa-5', title: 'Send Emergency Broadcast', subtitle: 'SMS and push notification to all parents', category: 'Quick Actions', href: '/dashboard/emergency-center', icon: Megaphone },

  // Students
  { id: 'st-1', title: 'Aarav Sharma', subtitle: 'GGPS2026LKG001 • Class LKG A', category: 'Students', href: '/dashboard/students', icon: GraduationCap },
  { id: 'st-2', title: 'Ananya Patel', subtitle: 'GGPS2026PREKG001 • Class PreKG A', category: 'Students', href: '/dashboard/students', icon: GraduationCap },
  { id: 'st-3', title: 'Rohan Verma', subtitle: 'GGPS2026UKG001 • Class UKG A', category: 'Students', href: '/dashboard/students', icon: GraduationCap },
  { id: 'st-4', title: 'Diya Sengupta', subtitle: 'GGPS2026LKG002 • Class LKG B', category: 'Students', href: '/dashboard/students', icon: GraduationCap },

  // Admissions
  { id: 'adm-1', title: 'ADM-2026-089: Aarav Sharma', subtitle: 'Status: Admission Confirmed • LKG', category: 'Admissions', href: '/dashboard/admissions', icon: Sparkles },
  { id: 'adm-2', title: 'ADM-2026-088: Ananya Patel', subtitle: 'Status: Approved • Pre-KG', category: 'Admissions', href: '/dashboard/admissions', icon: Sparkles },
  { id: 'adm-3', title: 'ADM-2026-087: Rohan Verma', subtitle: 'Status: Demo Scheduled • UKG', category: 'Admissions', href: '/dashboard/admissions', icon: Sparkles },

  // Finance
  { id: 'fin-1', title: 'INV-2026-0042', subtitle: '₹45,000 Term 1 Tuition Fee • Paid', category: 'Finance', href: '/dashboard/fees', icon: Receipt },
  { id: 'fin-2', title: 'INV-2026-0043', subtitle: '₹22,000 Annual Lab & Activity Fee • Pending', category: 'Finance', href: '/dashboard/fees', icon: Receipt },
  { id: 'fin-3', title: 'Staff Payroll Ledger', subtitle: 'Monthly faculty salary distribution', category: 'Finance', href: '/dashboard/payroll', icon: DollarSign },

  // Modules
  { id: 'mod-1', title: 'Executive Dashboard', subtitle: 'Institutional KPIs & pipeline overview', category: 'Modules', href: '/dashboard', icon: BarChart3 },
  { id: 'mod-2', title: 'Admissions Command Desk', subtitle: 'Complete applicant lifecycle & pipeline', category: 'Modules', href: '/dashboard/admissions', icon: Sparkles },
  { id: 'mod-3', title: 'Student 360° Directory', subtitle: 'Enrollment, academics & parent profiles', category: 'Modules', href: '/dashboard/students', icon: GraduationCap },
  { id: 'mod-4', title: 'Academics & Timetable', subtitle: 'Classes, subjects, curriculum & exams', category: 'Modules', href: '/dashboard/academic', icon: BookOpen },
  { id: 'mod-5', title: 'Attendance Engine', subtitle: 'Student and staff biometric logs', category: 'Modules', href: '/dashboard/attendance', icon: UserCheck },
  { id: 'mod-6', title: 'Fee Management', subtitle: 'Billing, receipts & defaulters ledger', category: 'Modules', href: '/dashboard/fees', icon: DollarSign },
  { id: 'mod-7', title: 'Faculty & HR', subtitle: 'Teacher directory, leave & attendance', category: 'Modules', href: '/dashboard/teachers', icon: Users },
  { id: 'mod-8', title: 'Supplies & Inventory', subtitle: 'Stock tracking, assets & logistics', category: 'Operations', href: '/dashboard/inventory', icon: Package },
  { id: 'mod-9', title: 'Reports & Audits', subtitle: 'Export academic, financial & attendance logs', category: 'Modules', href: '/dashboard/reports', icon: BarChart3 },
  { id: 'mod-10', title: 'System Settings', subtitle: 'Campuses, security & configuration', category: 'Modules', href: '/dashboard/settings', icon: Settings },
];

const ICON_MAP: Record<string, any> = {
  GraduationCap,
  Sparkles,
  UserCheck,
  Users,
  Briefcase,
  DollarSign,
  Calendar,
  Receipt,
  PlusCircle,
  Megaphone,
  BarChart3,
  BookOpen,
  Settings,
  Package,
};

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [serverResults, setServerResults] = useState<SearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Fetch live search results from backend API when typing
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setServerResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const res = await authFetch(`${apiBase}/api/v1/search?q=${encodeURIComponent(query.trim())}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
        });

        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            const mapped: SearchItem[] = json.data.map((item: any) => ({
              id: item.id,
              title: item.title,
              subtitle: item.subtitle,
              category: item.category as any,
              href: item.href,
              icon: ICON_MAP[item.icon] || GraduationCap,
            }));
            setServerResults(mapped);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Search query error:', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const filtered = useMemo(() => {
    if (!query.trim()) return GLOBAL_SEARCH_ITEMS.slice(0, 12);
    const q = query.toLowerCase();
    const localFiltered = GLOBAL_SEARCH_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
    );

    // Merge server results first, avoiding duplicate IDs
    const seen = new Set<string>();
    const combined: SearchItem[] = [];

    serverResults.forEach((item) => {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        combined.push(item);
      }
    });

    localFiltered.forEach((item) => {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        combined.push(item);
      }
    });

    return combined;
  }, [query, serverResults]);

  // Group filtered by category
  const grouped = useMemo(() => {
    const map = new Map<string, SearchItem[]>();
    filtered.forEach((item) => {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setSelectedIndex(0);
  }

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(href);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        handleSelect(filtered[selectedIndex].href);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-[#07152F]/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#08152F] border border-[#E6EAF2] dark:border-slate-800 w-full max-w-2xl rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0B1735]/60 shrink-0">
          <Search className="h-5 w-5 text-[#0050CB] dark:text-[#E5EEFF] mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search students, admissions, invoices, modules... (⌘ K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm font-semibold text-[#000E28] dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No results found for &ldquo;<span className="text-slate-600 dark:text-slate-200">{query}</span>&rdquo;
            </div>
          ) : (
            grouped.map(([category, items]) => (
              <div key={category} className="space-y-1">
                <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {category}
                </div>
                {items.map((item) => {
                  const Icon = item.icon;
                  const itemIndex = filtered.indexOf(item);
                  const isSelected = itemIndex === selectedIndex;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item.href)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#0050CB] text-white shadow-md'
                          : 'hover:bg-slate-50 dark:hover:bg-[#0B1F3A] text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-[#0050CB] dark:text-[#E5EEFF]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#000E28] dark:text-white'}`}>
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className={`text-[11px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#0B1735] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span>Navigate:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
              ↑
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
              ↓
            </kbd>
            <span className="ml-2">Select:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
              ↵
            </kbd>
          </div>
          <div>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
              ESC
            </kbd>{' '}
            to close
          </div>
        </div>
      </div>
    </div>
  );
}
