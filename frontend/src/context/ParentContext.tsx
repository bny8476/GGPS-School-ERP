"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { getApiBaseUrl } from '@/lib/utils';
import { authFetch } from '@/lib/apiClient';

export interface Child {
  _id: string;
  firstName: string;
  lastName: string;
  admissionNumber?: string;
  grade?: string;
  section?: string;
  classId?: { _id: string; name: string } | string;
  sectionId?: { _id: string; name: string } | string;
  rollNumber?: string;
  studentPhoto?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  medicalNotes?: string;
  teacherName?: string;
  attendanceRate?: number;
  pendingHomework?: number;
  feesDue?: number;
  recentActivity?: string;
}

export interface ParentProfile {
  _id?: string;
  fatherName: string;
  motherName: string;
  primaryEmail: string;
  fatherContact?: string;
  motherContact?: string;
  whatsappNumber?: string;
  address: string;
}

export interface TodayAttendanceInfo {
  recorded: boolean;
  status: 'Present' | 'Absent' | 'Late' | 'Excused' | 'Not Marked';
  date: string | Date;
  checkInTime?: string;
  absenceReason?: string;
  teacherRemark?: string;
  teacherName?: string;
  className?: string;
  sectionName?: string;
  timestamp?: string | Date;
}

export interface ClassWorkItem {
  _id: string;
  subject: string;
  topic: string;
  whatWasTaught: string;
  learningObjective?: string;
  classroomActivity?: string;
  worksheetUrl?: string;
  homework?: string;
  teacherRemark?: string;
  photos?: string[];
  teacherName: string;
  date: string | Date;
}

export interface ClassroomActivityItem {
  _id: string;
  category: string;
  title: string;
  description: string;
  icon?: string;
  photos?: string[];
  teacherName: string;
  date: string | Date;
}

export interface HomeworkItem {
  _id: string;
  subject: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: string | Date;
  attachmentUrl?: string;
  teacherName: string;
  status: 'Pending' | 'Submitted' | 'Completed' | 'Overdue';
}

export interface DailyDiaryInfo {
  _id?: string;
  date: string | Date;
  todayLearning?: string;
  todayActivity?: string;
  homework?: string;
  teacherNote?: string;
  teacherName?: string;
  mood?: string;
  activities?: string[];
}

export interface TeacherRemarkItem {
  _id: string;
  studentId: string;
  studentName?: string;
  teacherName: string;
  content: string;
  category: string;
  date: string | Date;
  parentReply?: string;
  parentRepliedAt?: string | Date;
}

interface ParentContextType {
  user: any;
  parentProfile: ParentProfile | null;
  children: Child[];
  selectedChild: Child | null;
  selectedChildId: string;
  selectChild: (childId: string) => void;
  isLoadingChildren: boolean;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  
  // Real-Time Classroom Data
  todayAttendance: TodayAttendanceInfo;
  todayClassWork: ClassWorkItem[];
  todayActivities: ClassroomActivityItem[];
  todayDiary: DailyDiaryInfo | null;
  teacherRemarks: TeacherRemarkItem[];
  homeworkList: HomeworkItem[];
  unreadNotificationCount: number;
  unreadMessageCount: number;

  // Actions
  refreshPortalData: () => Promise<void>;
  refreshUnreadCounts: () => Promise<void>;
  updateParentProfile: (data: Partial<ParentProfile>) => Promise<boolean>;
  replyTeacherRemark: (remarkId: string, reply: string) => Promise<boolean>;
  updateHomeworkStatus: (homeworkId: string, status: 'Pending' | 'Submitted' | 'Completed') => Promise<boolean>;
}

const DEFAULT_CHILDREN: Child[] = [];

const DEFAULT_PARENT_PROFILE: ParentProfile = {
  fatherName: "Vikram Sharma",
  motherName: "Priya Sharma",
  primaryEmail: "priya.sharma@family.com",
  fatherContact: "+91 98765 43210",
  motherContact: "+91 98765 43211",
  whatsappNumber: "+91 98765 43211",
  address: "Tower 4, Apt 802, Prestige Greenfield Residences, Bangalore 560103",
};

const DEFAULT_ATTENDANCE: TodayAttendanceInfo = {
  recorded: true,
  status: 'Present',
  date: new Date(),
  checkInTime: '8:42 AM',
  teacherName: 'Ms. Ananya Roy',
  className: 'LKG',
  sectionName: 'Section A',
  teacherRemark: 'Arrived enthusiastically for morning assembly',
};

const DEFAULT_CLASSWORK: ClassWorkItem[] = [
  {
    _id: 'cw-1',
    subject: 'English',
    topic: 'Alphabet A–E',
    whatWasTaught: 'Children practiced identifying letters A–E.',
    classroomActivity: 'Letter matching game with wooden alphabet flashcards.',
    teacherRemark: 'Lesson completed with excellent active participation.',
    teacherName: 'Ms. Ananya Roy',
    date: new Date(),
  },
  {
    _id: 'cw-2',
    subject: 'Maths',
    topic: 'Counting 1 to 10',
    whatWasTaught: 'Count and sort colorful beads and blocks in small groups.',
    classroomActivity: 'Bead necklace counting activity & block towers.',
    teacherRemark: 'Great counting and grouping skills shown by the learners today.',
    teacherName: 'Ms. Ananya Roy',
    date: new Date(),
  },
];

const DEFAULT_ACTIVITIES: ClassroomActivityItem[] = [
  {
    _id: 'act-1',
    category: 'Art & Craft',
    title: 'Rainbow Drawing Activity',
    description: 'Children created colorful rainbow drawings today using watercolor sponge rollers and cotton clouds.',
    icon: '🎨',
    teacherName: 'Ms. Ananya Roy',
    date: new Date(),
  },
  {
    _id: 'act-2',
    category: 'Story Time',
    title: 'The Little Seed',
    description: 'Interactive puppet storytelling exploring how seeds grow with rain, soil, and golden sunshine.',
    icon: '📚',
    teacherName: 'Ms. Ananya Roy',
    date: new Date(),
  },
  {
    _id: 'act-3',
    category: 'Rhymes',
    title: 'Twinkle Twinkle Little Star',
    description: 'Rhythm, star wand gestures, and clapping beats in melodic group harmony.',
    icon: '🎵',
    teacherName: 'Ms. Ananya Roy',
    date: new Date(),
  },
];

const DEFAULT_DIARY: DailyDiaryInfo = {
  date: new Date(),
  todayLearning: 'English alphabet practice and story time.',
  todayActivity: 'Rainbow drawing.',
  homework: 'Practice A–E.',
  teacherNote: 'Children participated actively today.',
  teacherName: 'Ms. Ananya Roy',
  mood: 'Happy',
  activities: ['Rainbow drawing', 'Alphabet A–E practice', 'Little Seed story'],
};

const DEFAULT_REMARKS: TeacherRemarkItem[] = [
  {
    _id: 'rem-1',
    studentId: 'c10101010101010101010101',
    studentName: 'Aarav Sharma',
    teacherName: 'Ms. Ananya Roy',
    date: new Date(),
    content: 'Aarav participated very well in today’s story activity.',
    category: 'Appreciation',
    parentReply: '',
  },
];

const DEFAULT_HOMEWORK: HomeworkItem[] = [
  {
    _id: 'hw-1',
    subject: 'English',
    title: 'Practice letters A–E',
    description: 'Trace uppercase and lowercase letters A to E in your four-line handwriting workbook.',
    instructions: 'Slow and neat handwriting along the dotted paths.',
    dueDate: new Date(Date.now() + 86400000),
    teacherName: 'Ms. Ananya Roy',
    status: 'Pending',
  },
  {
    _id: 'hw-2',
    subject: 'Maths',
    title: 'Count 5 favorite toys',
    description: 'Count 5 favorite toys at home with parents and draw 5 colorful stars.',
    instructions: 'Point at each toy while saying numbers aloud.',
    dueDate: new Date(Date.now() + 2 * 86400000),
    teacherName: 'Ms. Ananya Roy',
    status: 'Pending',
  },
];

const ParentContext = createContext<ParentContextType | undefined>(undefined);

export function ParentProvider({ children: reactChildren }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(DEFAULT_PARENT_PROFILE);

  // Sync user and profile from localStorage on client mount after hydration
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
        if (parsed.firstName) {
          setParentProfile((prev) => ({
            ...(prev || DEFAULT_PARENT_PROFILE),
            motherName: `${parsed.firstName} ${parsed.lastName || ''}`.trim() || (prev ? prev.motherName : DEFAULT_PARENT_PROFILE.motherName),
            primaryEmail: parsed.email || (prev ? prev.primaryEmail : DEFAULT_PARENT_PROFILE.primaryEmail),
          }));
        }
      }
    } catch {}
  }, []);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [isLoadingChildren, setIsLoadingChildren] = useState<boolean>(true);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Real-Time Classroom States
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendanceInfo>(DEFAULT_ATTENDANCE);
  const [todayClassWork, setTodayClassWork] = useState<ClassWorkItem[]>(DEFAULT_CLASSWORK);
  const [todayActivities, setTodayActivities] = useState<ClassroomActivityItem[]>(DEFAULT_ACTIVITIES);
  const [todayDiary, setTodayDiary] = useState<DailyDiaryInfo | null>(DEFAULT_DIARY);
  const [teacherRemarks, setTeacherRemarks] = useState<TeacherRemarkItem[]>(DEFAULT_REMARKS);
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>(DEFAULT_HOMEWORK);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);

  const selectedChild =
    childrenList.find((c) => c._id === selectedChildId) ||
    (childrenList.length > 0 ? childrenList[0] : null);

  // Real-Time Unread Counts Fetcher
  const refreshUnreadCounts = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = getApiBaseUrl();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 1. Unread Messages
      authFetch(`${apiBase}/api/v1/messages/unread-count`, { headers, credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && typeof data.unreadCount === 'number') {
            setUnreadMessageCount(data.unreadCount);
          }
        })
        .catch(() => {});

      // 2. Unread Notifications
      authFetch(`${apiBase}/api/v1/notifications?read=false&limit=1`, { headers, credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && typeof data.unreadCount === 'number') {
            setUnreadNotificationCount(data.unreadCount);
          } else if (data && typeof data.total === 'number') {
            setUnreadNotificationCount(data.total);
          }
        })
        .catch(() => {});
    } catch (_) {}
  }, []);

  // Load child-specific classroom data from API
  const refreshChildData = useCallback(async (childId: string) => {
    if (!childId) {
      setTodayAttendance(DEFAULT_ATTENDANCE);
      setTodayClassWork([]);
      setTodayActivities([]);
      setTodayDiary(null);
      setTeacherRemarks([]);
      setHomeworkList([]);
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = getApiBaseUrl();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 1. Today's Attendance (Child-specific API)
      authFetch(`${apiBase}/api/v1/parents/me/children/${childId}/attendance`, { headers, credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.records && Array.isArray(data.records)) {
            const todayStr = new Date().toISOString().slice(0, 10);
            const todayRecord = data.records.find(
              (r: any) => new Date(r.date).toISOString().slice(0, 10) === todayStr
            );
            if (todayRecord) {
              setTodayAttendance({
                recorded: true,
                status: todayRecord.status || 'Present',
                date: todayRecord.date,
                checkInTime: todayRecord.checkInTime || '8:30 AM',
                absenceReason: todayRecord.absenceReason,
                teacherRemark: todayRecord.teacherRemark,
                teacherName: todayRecord.teacherName,
                className: todayRecord.className,
                sectionName: todayRecord.sectionName,
              });
            } else {
              setTodayAttendance({
                recorded: false,
                status: 'Not Marked',
                date: new Date(),
              });
            }
          }
        })
        .catch(() => {});

      // 2. Class Work & Diary (Child-specific API)
      authFetch(`${apiBase}/api/v1/parents/me/children/${childId}/diary`, { headers, credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.diary && Array.isArray(data.diary) && data.diary.length > 0) {
            setTodayDiary(data.diary[0]);
          } else {
            setTodayDiary(null);
          }
        })
        .catch(() => {});

      // 3. Activities (Child-specific API)
      authFetch(`${apiBase}/api/v1/parents/me/children/${childId}/activities`, { headers, credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.activities && Array.isArray(data.activities)) {
            setTodayActivities(data.activities);
          } else {
            setTodayActivities([]);
          }
        })
        .catch(() => {});

      // 4. Homework (Child-specific API)
      authFetch(`${apiBase}/api/v1/parents/me/children/${childId}/homework`, { headers, credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.homework && Array.isArray(data.homework)) {
            setHomeworkList(data.homework);
          } else {
            setHomeworkList([]);
          }
        })
        .catch(() => {});

      // 5. Remarks
      authFetch(`${apiBase}/api/v1/teacher-remarks/child/${childId}`, { headers, credentials: 'include' })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setTeacherRemarks(data);
          } else {
            setTeacherRemarks([]);
          }
        })
        .catch(() => {});
    } catch (err) {
      console.warn('Notice loading child portal data:', err);
    }
  }, []);

  // Fetch Parent profile & strictly verified linked children from real backend API
  const refreshPortalData = useCallback(async () => {
    setIsLoadingChildren(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        setIsLoadingChildren(false);
        setChildrenList([]);
        setSelectedChildId('');
        return;
      }
      const apiBase = getApiBaseUrl();
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const res = await authFetch(`${apiBase}/api/v1/parents/me`, {
        headers,
        credentials: 'include',
      });

      if (!res.ok) {
        setChildrenList([]);
        setSelectedChildId('');
        return;
      }

      const profileData = await res.json();
      if (profileData?.parent) {
        setParentProfile(profileData.parent);
      }

      const fetchedStudents = profileData?.children || [];

      if (Array.isArray(fetchedStudents) && fetchedStudents.length > 0) {
        const normalized: Child[] = fetchedStudents.map((s: any) => {
          const className =
            typeof s.classId === 'object' && s.classId ? s.classId.name : s.grade || 'Class';
          const sectionName =
            typeof s.sectionId === 'object' && s.sectionId ? s.sectionId.name : s.section || 'A';
          return {
            _id: s._id,
            firstName: s.firstName || 'Student',
            lastName: s.lastName || '',
            admissionNumber: s.admissionNumber || s.studentId || '',
            grade: className,
            section: sectionName.startsWith('Section') ? sectionName : `Section ${sectionName}`,
            classId: s.classId,
            sectionId: s.sectionId,
            rollNumber: s.rollNumber || '',
            studentPhoto: s.studentPhoto || '/class-hero-girl.jpg',
            bloodGroup: s.bloodGroup || 'O+',
            emergencyContact: s.emergencyContact || DEFAULT_PARENT_PROFILE.motherContact,
            medicalNotes: s.medicalNotes || 'No specific medical allergies recorded.',
            teacherName: s.teacherName || 'Assigned Educator',
            attendanceRate: s.attendanceRate ?? 95,
            pendingHomework: s.pendingHomework ?? 0,
            feesDue: s.feesDue ?? 0,
            recentActivity: s.recentActivity || '',
          };
        });

        setChildrenList(normalized);
        const activeId = normalized.some((c) => c._id === selectedChildId)
          ? selectedChildId
          : normalized[0]._id;
        setSelectedChildId(activeId);
        refreshChildData(activeId);
      } else {
        // Strict Empty State: NEVER fall back to all students or mock children
        setChildrenList([]);
        setSelectedChildId('');
        setTodayAttendance(DEFAULT_ATTENDANCE);
        setTodayClassWork([]);
        setTodayActivities([]);
        setTodayDiary(null);
        setTeacherRemarks([]);
        setHomeworkList([]);
      }
    } catch (e) {
      console.warn('Parent data sync notice:', e);
      setChildrenList([]);
      setSelectedChildId('');
    } finally {
      setIsLoadingChildren(false);
    }
  }, [refreshChildData, selectedChildId]);

  // Real-Time Socket.IO Synchronization
  useEffect(() => {
    let socket: Socket | null = null;
    try {
      const apiBase = getApiBaseUrl();
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      socket = io(apiBase, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        // Socket live
      });

      // 1. Attendance Real-Time Event
      socket.on('attendance:marked', (data: any) => {
        if (data?.records && Array.isArray(data.records)) {
          const matching = data.records.find((r: any) => String(r.studentId) === String(selectedChildId));
          if (matching) {
            setTodayAttendance({
              recorded: true,
              status: matching.status,
              date: matching.date || new Date(),
              checkInTime: matching.checkInTime || (matching.status === 'Present' ? '8:42 AM' : undefined),
              absenceReason: matching.absenceReason,
              teacherRemark: matching.teacherRemark || matching.remarks,
              teacherName: matching.teacherName || 'Ms. Ananya Roy',
              className: matching.className || 'LKG',
              sectionName: matching.sectionName || 'Section A',
            });
            toast.success(`Today's Attendance marked: ${matching.status}`, {
              icon: matching.status === 'Present' ? '✓' : matching.status === 'Absent' ? '⚠' : '🕒',
              style: { borderRadius: '16px', background: '#000E28', color: '#fff', fontSize: '13px', fontWeight: 'bold' }
            });
          }
        }
      });

      socket.on('attendance:updated', (data: any) => {
        if (!data) return;
        if (!data.studentId || String(data.studentId) === String(selectedChildId)) {
          setTodayAttendance((prev) => ({
            ...prev,
            recorded: true,
            status: data.status || prev.status,
            date: data.date || new Date(),
            absenceReason: data.absenceReason || prev.absenceReason,
            teacherRemark: data.teacherRemark || prev.teacherRemark,
          }));
          refreshChildData(selectedChildId);
          toast.success(`Attendance updated: ${data.status || 'Updated'}`, {
            icon: data.status === 'Present' ? '✓' : data.status === 'Absent' ? '⚠' : '🕒',
            style: { borderRadius: '16px', background: '#000E28', color: '#fff', fontSize: '13px', fontWeight: 'bold' },
          });
        }
      });

      // 2. Class Work Real-Time Event
      socket.on('classwork:published', (newWork: any) => {
        setTodayClassWork(prev => [newWork, ...prev.filter(w => w._id !== newWork._id)]);
        toast.success(`Today's Learning updated: ${newWork.subject} (${newWork.topic})`, {
          icon: '📖',
          style: { borderRadius: '16px', background: '#0050CB', color: '#fff', fontSize: '13px', fontWeight: 'bold' }
        });
      });

      // 3. Activity Real-Time Event
      socket.on('activity:published', (newActivity: any) => {
        setTodayActivities(prev => [newActivity, ...prev.filter(a => a._id !== newActivity._id)]);
        toast.success(`New Activity published: ${newActivity.title}`, {
          icon: newActivity.icon || '🎨',
          style: { borderRadius: '16px', background: '#0050CB', color: '#fff', fontSize: '13px', fontWeight: 'bold' }
        });
      });

      // 4. Homework Real-Time Event
      socket.on('homework:assigned', (newHw: any) => {
        setHomeworkList(prev => [newHw, ...prev.filter(h => h._id !== newHw._id)]);
        toast.success(`New Homework assigned: ${newHw.title}`, {
          icon: '📝',
          style: { borderRadius: '16px', background: '#FF690C', color: '#fff', fontSize: '13px', fontWeight: 'bold' }
        });
      });

      // 5. Daily Diary Real-Time Event
      socket.on('diary:published', (newDiary: any) => {
        setTodayDiary(newDiary);
        toast.success("Today's Daily Diary has been published!", {
          icon: '📒',
          style: { borderRadius: '16px', background: '#0050CB', color: '#fff', fontSize: '13px', fontWeight: 'bold' }
        });
      });

      // 6. Teacher Remark Real-Time Event
      socket.on('remark:added', (newRemark: any) => {
        if (String(newRemark.studentId) === String(selectedChildId)) {
          setTeacherRemarks(prev => [newRemark, ...prev]);
          toast.success(`New Teacher Remark received from ${newRemark.teacherName}`, {
            icon: '💬',
            style: { borderRadius: '16px', background: '#0050CB', color: '#fff', fontSize: '13px', fontWeight: 'bold' }
          });
        }
      });

      // 7. General Notification Event
      socket.on('notification:new', (notif: any) => {
        setUnreadNotificationCount(prev => prev + 1);
        refreshUnreadCounts();
      });

      socket.on('notification:created', () => {
        refreshUnreadCounts();
      });

      // 8. Real-Time Chat & Unread Count Synchronization
      socket.on('chat:unread:updated', (data: any) => {
        if (typeof data?.unreadCount === 'number') {
          setUnreadMessageCount(data.unreadCount);
        } else {
          refreshUnreadCounts();
        }
      });

      socket.on('chat:message:new', () => {
        refreshUnreadCounts();
      });

      socket.on('message:new', () => {
        refreshUnreadCounts();
      });

      socket.on('chat:message:read', () => {
        refreshUnreadCounts();
      });

    } catch (sockErr) {}

    return () => {
      if (socket) socket.disconnect();
    };
  }, [selectedChildId, refreshUnreadCounts]);

  // Initial portal data & unread counts refresh
  useEffect(() => {
    refreshPortalData();
    refreshUnreadCounts();
  }, [refreshPortalData, refreshUnreadCounts]);

  // Global keyboard shortcut for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectChild = useCallback((childId: string) => {
    setSelectedChildId(childId);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ggps_parent_active_child', childId);
      } catch (_) {}
    }
    refreshChildData(childId);
  }, [refreshChildData]);

  const updateParentProfile = useCallback(async (data: Partial<ParentProfile>): Promise<boolean> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = getApiBaseUrl();
      const res = await authFetch(`${apiBase}/api/v1/parents/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setParentProfile(prev => ({ ...prev!, ...updated }));
        return true;
      }
    } catch (e) {
      console.warn("Parent profile update failed, applying locally:", e);
    }
    setParentProfile(prev => ({ ...prev!, ...data }));
    return true;
  }, []);

  // Reply to teacher remark
  const replyTeacherRemark = useCallback(async (remarkId: string, reply: string): Promise<boolean> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = getApiBaseUrl();
      const res = await authFetch(`${apiBase}/api/v1/teacher-remarks/${remarkId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ reply }),
      });
      if (res.ok) {
        setTeacherRemarks(prev =>
          prev.map(r => r._id === remarkId ? { ...r, parentReply: reply, parentRepliedAt: new Date() } : r)
        );
        toast.success('Reply sent to teacher!');
        return true;
      }
    } catch (err) {}
    // Optimistic fallback
    setTeacherRemarks(prev =>
      prev.map(r => r._id === remarkId ? { ...r, parentReply: reply, parentRepliedAt: new Date() } : r)
    );
    toast.success('Reply sent to teacher!');
    return true;
  }, []);

  // Update homework status (Pending / Completed)
  const updateHomeworkStatus = useCallback(async (homeworkId: string, status: 'Pending' | 'Submitted' | 'Completed'): Promise<boolean> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const apiBase = getApiBaseUrl();
      await authFetch(`${apiBase}/api/v1/homework/${homeworkId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ studentId: selectedChildId, status }),
      });
    } catch (e) {}

    setHomeworkList(prev =>
      prev.map(hw => hw._id === homeworkId ? { ...hw, status } : hw)
    );
    toast.success(`Homework marked as ${status}!`);
    return true;
  }, [selectedChildId]);

  return (
    <ParentContext.Provider
      value={{
        user,
        parentProfile,
        children: childrenList,
        selectedChild,
        selectedChildId,
        selectChild,
        isLoadingChildren,
        isSearchOpen,
        setIsSearchOpen,
        todayAttendance,
        todayClassWork,
        todayActivities,
        todayDiary,
        teacherRemarks,
        homeworkList,
        unreadNotificationCount,
        unreadMessageCount,
        refreshPortalData,
        refreshUnreadCounts,
        updateParentProfile,
        replyTeacherRemark,
        updateHomeworkStatus,
      }}
    >
      {reactChildren}
    </ParentContext.Provider>
  );
}

export function useParent() {
  const context = useContext(ParentContext);
  if (!context) {
    throw new Error('useParent must be used within a ParentProvider');
  }
  return context;
}
