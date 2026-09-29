import { Router } from 'express';

// Domain Modules
import { authRoutes } from './auth';
import { studentRoutes } from './students';
import { academicRoutes, classRoutes, curriculumRoutes } from './academics';
import { attendanceRoutes } from './attendance';
import { parentRoutes } from './parents';
import { userRoutes, payrollRoutes, leaveRoutes, recruitmentRoutes } from './hr';
import { admissionRoutes } from './admissions';
import enrollmentRoutes from '../routes/enrollmentRoutes';
import idCardRoutes from '../routes/idCardRoutes';
import { financeRoutes } from './finance';
import {
  dailyDiaryRoutes,
  assessmentRoutes,
  examRoutes,
  learningRoutes,
  classWorkRoutes,
  activityRoutes,
  homeworkRoutes,
  teacherRemarkRoutes,
} from './learning';
import {
  operationsRoutes,
  transportRoutes,
  bookRoutes,
  daycareRoutes,
  eventsRoutes,
  galleryRoutes,
  hostelRoutes,
  inventoryRoutes,
  visitorRoutes,
} from './operations';
import {
  announcementRoutes,
  notificationRoutes,
  broadcastRoutes,
  emailRoutes,
} from './communication';
import messageRoutes from '../routes/messageRoutes';
import disciplineRoutes from '../routes/disciplineRoutes';
import reportRoutes from '../routes/reportRoutes';
import roleRoutes from '../routes/roleRoutes';
import searchRoutes from '../routes/searchRoutes';
import {
  healthRoutes,
  dashboardRoutes,
  auditRoutes,
  settingsRoutes,
  campusRoutes,
  enterpriseRoutes,
  appsRoutes,
  aiRoutes,
  nextGenRoutes,
  noteRoutes,
  documentRoutes,
  ticketRoutes,
} from './core';

/**
 * Registers all domain module routes onto the canonical API router.
 */
export function registerDomainModules(apiRouter: Router): void {
  // Core & Health
  apiRouter.use('/health', healthRoutes);
  apiRouter.use('/dashboard', dashboardRoutes);
  apiRouter.use('/audit', auditRoutes);
  apiRouter.use('/settings', settingsRoutes);
  apiRouter.use('/roles', roleRoutes);
  apiRouter.use('/campuses', campusRoutes);
  apiRouter.use('/enterprise', enterpriseRoutes);
  apiRouter.use('/apps', appsRoutes);
  apiRouter.use('/ai', aiRoutes);
  apiRouter.use('/nextgen', nextGenRoutes);
  apiRouter.use('/notes', noteRoutes);
  apiRouter.use('/documents', documentRoutes);
  apiRouter.use('/tickets', ticketRoutes);
  apiRouter.use('/search', searchRoutes);

  // Authentication & Identity
  apiRouter.use('/auth', authRoutes);

  // Students & Academics
  apiRouter.use('/students', studentRoutes);
  apiRouter.use('/discipline', disciplineRoutes);
  apiRouter.use('/id-cards', idCardRoutes);
  apiRouter.use('/enrollment', enrollmentRoutes);
  apiRouter.use('/academic', academicRoutes);
  apiRouter.use('/classes', classRoutes);
  apiRouter.use('/curriculum', curriculumRoutes);

  // Attendance
  apiRouter.use('/attendance', attendanceRoutes);

  // Parents
  apiRouter.use('/parents', parentRoutes);

  // HR & Staff
  apiRouter.use('/users', userRoutes);
  apiRouter.use('/payroll', payrollRoutes);
  apiRouter.use('/leaves', leaveRoutes);
  apiRouter.use('/recruitment', recruitmentRoutes);

  // Admissions
  apiRouter.use('/admissions', admissionRoutes);

  // Finance
  apiRouter.use('/finance', financeRoutes);

  // Learning & Assessments
  apiRouter.use('/daily-diary', dailyDiaryRoutes);
  apiRouter.use('/assessments', assessmentRoutes);
  apiRouter.use('/exams', examRoutes);
  apiRouter.use('/learning', learningRoutes);
  apiRouter.use('/classwork', classWorkRoutes);
  apiRouter.use('/activities', activityRoutes);
  apiRouter.use('/homework', homeworkRoutes);
  apiRouter.use('/teacher-remarks', teacherRemarkRoutes);

  // Operations
  apiRouter.use('/operations', operationsRoutes);
  apiRouter.use('/transport', transportRoutes);
  apiRouter.use('/books', bookRoutes);
  apiRouter.use('/daycare', daycareRoutes);
  apiRouter.use('/events', eventsRoutes);
  apiRouter.use('/gallery', galleryRoutes);
  apiRouter.use('/hostel', hostelRoutes);
  apiRouter.use('/inventory', inventoryRoutes);
  apiRouter.use('/visitors', visitorRoutes);

  // Communication
  apiRouter.use('/announcements', announcementRoutes);
  apiRouter.use('/notifications', notificationRoutes);
  apiRouter.use('/messages', messageRoutes);
  apiRouter.use('/chat', messageRoutes);
  apiRouter.use('/broadcasts', broadcastRoutes);
  apiRouter.use('/email', emailRoutes);

  // Reports
  apiRouter.use('/reports', reportRoutes);
}

// Export all modules for direct domain imports
export * from './auth';
export * from './students';
export * from './academics';
export * from './attendance';
export * from './parents';
export * from './hr';
export * from './admissions';
export * from './finance';
export * from './learning';
export * from './operations';
export * from './communication';
export * from './core';
