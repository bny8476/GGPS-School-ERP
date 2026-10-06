import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Student from '../models/Student';
import Admission from '../models/Admission';
import Fee from '../models/Fee';
import Attendance from '../models/Attendance';
import Event from '../models/Event';
import User from '../models/User';
import Role from '../models/Role';
import Employee from '../models/Employee';
import Parent from '../models/Parent';
import StudentParent from '../models/StudentParent';
import DayCareLog from '../models/DayCareLog';
import Album from '../models/Album';
import DailyDiary from '../models/DailyDiary';
import Assessment from '../models/Assessment';
import TimeTable from '../models/TimeTable';
import AuditLog from '../models/AuditLog';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  const role = (req.user?.role || '').toLowerCase();

  if (mongoose.connection.readyState !== 1) {
    res.json({
      isParentPortal: role === 'parent',
      isTeacherPortal: role === 'teacher',
      message: 'Database unavailable',
    });
    return;
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // ==========================================
    // PARENT PORTAL LOGIC
    // ==========================================
    if (req.user?.role === 'Parent') {
      const parent = await Parent.findOne({ userId: req.user.id });
      if (!parent) {
        res.json({
          isParentPortal: true,
          isTeacherPortal: false,
          myChildren: [],
          feesDue: [],
          recentAttendance: [],
          upcomingEvents: [],
          recentDaycareLogs: [],
          recentAlbums: [],
        });
        return;
      }

      const linkedRecords = await StudentParent.find({ parentId: parent._id }).select('studentId');
      const linkedStudentIds = linkedRecords.map((r) => r.studentId);
      const directStudents = await Student.find({ parentId: parent._id }).select('_id');
      const childrenIds = [...new Set([...linkedStudentIds.map(String), ...directStudents.map((s) => String(s._id))])].map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      const [myChildren, feesDue, recentAttendance, upcomingEvents, recentDaycareLogs, recentAlbums] =
        await Promise.all([
          Student.find({ _id: { $in: childrenIds } }).sort({ firstName: 1 }),
          Fee.find({
            studentId: { $in: childrenIds },
            status: { $in: ['Pending', 'Overdue', 'Partial'] },
          }).sort({ dueDate: 1 }),
          Attendance.find({ studentId: { $in: childrenIds } }).sort({ date: -1 }).limit(10),
          Event.find({ date: { $gte: today }, audience: { $in: ['All', 'Parents'] } }).limit(5).sort({ date: 1 }),
          DayCareLog.find({ studentId: { $in: childrenIds } }).sort({ date: -1 }).limit(5),
          Album.find({ visibility: { $in: ['All', 'Parents'] } }).sort({ date: -1 }).limit(5),
        ]);

      res.json({
        isParentPortal: true,
        isTeacherPortal: false,
        myChildren,
        feesDue,
        recentAttendance,
        upcomingEvents,
        recentDaycareLogs,
        recentAlbums,
      });
      return;
    }

    // ==========================================
    // TEACHER PORTAL LOGIC
    // ==========================================
    if (req.user?.role === 'Teacher') {
      const teacherId = req.user.id;
      const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = [
        'Monday', // Sunday fallback
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Monday', // Saturday fallback
      ];
      const todayDayOfWeek = days[today.getDay()] || 'Monday';

      const [
        totalStudents,
        studentAttendancePresent,
        studentAttendanceAbsent,
        studentAttendanceLate,
        recentDiaryEntries,
        recentAssessments,
        upcomingEvents,
        teacherTimetables,
      ] = await Promise.all([
        Student.countDocuments({ status: 'Active' }),
        Attendance.countDocuments({ entityType: 'Student', date: { $gte: today, $lt: tomorrow }, status: 'Present' }),
        Attendance.countDocuments({ entityType: 'Student', date: { $gte: today, $lt: tomorrow }, status: 'Absent' }),
        Attendance.countDocuments({ entityType: 'Student', date: { $gte: today, $lt: tomorrow }, status: 'Late' }),
        DailyDiary.find({}).populate('studentId', 'firstName lastName grade').sort({ date: -1 }).limit(5),
        Assessment.find({ createdBy: teacherId }).populate('childId', 'firstName lastName grade').sort({ createdAt: -1 }).limit(5),
        Event.find({ date: { $gte: today } }).limit(5).sort({ date: 1 }),
        TimeTable.find({ dayOfWeek: todayDayOfWeek, 'periods.teacherId': teacherId })
          .populate('periods.subjectId', 'name')
          .populate('classId', 'name')
          .lean(),
      ]);

      const totalMarked = studentAttendancePresent + studentAttendanceAbsent + studentAttendanceLate;
      const isAttendanceMarked = totalMarked > 0;

      // Extract teacher's today schedule
      const todaySchedule: any[] = [];
      for (const tt of (teacherTimetables as any[])) {
        for (const p of tt.periods || []) {
          if (String(p.teacherId) === String(teacherId)) {
            todaySchedule.push({
              time: `${p.startTime} - ${p.endTime}`,
              subject: p.subjectId?.name || 'Class',
              room: p.room || 'Classroom',
              className: tt.classId?.name || 'Assigned Class',
            });
          }
        }
      }

      res.json({
        isTeacherPortal: true,
        isParentPortal: false,
        myClass: {
          className: 'Assigned Classes',
          totalChildren: totalStudents,
        },
        todayAttendance: {
          present: studentAttendancePresent,
          absent: studentAttendanceAbsent,
          late: studentAttendanceLate,
          total: totalStudents,
          isMarked: isAttendanceMarked,
        },
        todaySchedule,
        todayActivities: [],
        pendingWork: [
          {
            id: '1',
            title: 'Daily Attendance Roll-Call',
            status: isAttendanceMarked ? 'Completed' : 'Pending',
            priority: 'High',
          },
          {
            id: '2',
            title: 'Post Daily Diary Updates',
            status: recentDiaryEntries.length > 0 ? 'Completed' : 'Pending',
            priority: 'Medium',
          },
        ],
        reminders: [],
        recentDiaryEntries,
        recentAssessments,
        upcomingEvents,
        birthdays: [],
      });
      return;
    }

    // ==========================================
    // ADMIN / PRINCIPAL / STAFF PORTAL LOGIC
    // ==========================================
    // Look up staff roles by name to get their ObjectIds
    const staffRoles = await Role.find({
      name: { $in: ['Teacher', 'Staff', 'Accountant', 'Admin', 'Principal', 'HR', 'Receptionist', 'SuperAdmin', 'Librarian'] },
    }).select('_id');
    const staffRoleIds = staffRoles.map((r) => r._id);

    const [
      totalStudents,
      totalStaff,
      pendingAdmissions,
      newAdmissions,
      admissionInquiries,
      admissionInterviews,
      admissionsApproved,
      feesCollectedAggregation,
      feesPendingAggregation,
      feesOverdueAggregation,
      feesPendingList,
      studentAttendancePresent,
      studentAttendanceAbsent,
      studentAttendanceLate,
      staffAttendanceToday,
      upcomingEvents,
      recentAdmissionsList,
      allStudentsWithDob,
      recentAuditLogs,
    ] = await Promise.all([
      Student.countDocuments({ status: 'Active' }),
      staffRoleIds.length > 0
        ? User.countDocuments({ role: { $in: staffRoleIds }, isDeleted: { $ne: true } })
        : User.countDocuments({ isDeleted: { $ne: true } }),
      Admission.countDocuments({ status: { $in: ['Application Submitted', 'Interview Scheduled', 'In Review', 'Follow-up Pending', 'Interested', 'Under Review'] } }),
      Admission.countDocuments({ status: { $in: ['Approved', 'Admission Confirmed'] } }),
      Admission.countDocuments({ status: { $in: ['New Inquiry', 'Enquiry Submitted', 'Enquiry'] } }),
      Admission.countDocuments({ status: { $in: ['Demo Class Scheduled', 'Interview Scheduled', 'Interview'] } }),
      Admission.countDocuments({ status: { $in: ['Approved', 'Accepted'] } }),
      Fee.aggregate([
        { $match: { status: { $in: ['Paid', 'Partial'] } } },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } },
      ]).catch(() => []),
      Fee.aggregate([
        { $match: { status: { $in: ['Pending', 'Partial'] } } },
        { $group: { _id: null, total: { $sum: { $subtract: [{ $ifNull: ['$totalAmount', 0] }, { $ifNull: ['$amountPaid', 0] }] } } } },
      ]).catch(() => []),
      Fee.aggregate([
        { $match: { status: 'Overdue' } },
        { $group: { _id: null, total: { $sum: { $subtract: [{ $ifNull: ['$totalAmount', 0] }, { $ifNull: ['$amountPaid', 0] }] } } } },
      ]).catch(() => []),
      Fee.find({ status: { $in: ['Pending', 'Overdue'] } })
        .populate('studentId', 'firstName lastName grade studentId rollNumber')
        .limit(10)
        .sort({ dueDate: 1 })
        .catch(() => []),
      Attendance.countDocuments({ entityType: 'Student', date: { $gte: today, $lt: tomorrow }, status: 'Present' }).catch(() => 0),
      Attendance.countDocuments({ entityType: 'Student', date: { $gte: today, $lt: tomorrow }, status: 'Absent' }).catch(() => 0),
      Attendance.countDocuments({ entityType: 'Student', date: { $gte: today, $lt: tomorrow }, status: 'Late' }).catch(() => 0),
      Attendance.countDocuments({ entityType: 'User', date: { $gte: today, $lt: tomorrow }, status: 'Present' }).catch(() => 0),
      Event.find({ date: { $gte: today } }).limit(5).sort({ date: 1 }).catch(() => []),
      Admission.find({}).sort({ createdAt: -1 }).limit(10).catch(() => []),
      Student.find({ status: 'Active', dateOfBirth: { $exists: true, $ne: null } }).select('firstName lastName dateOfBirth grade studentId').catch(() => []),
      AuditLog.find({}).sort({ timestamp: -1 }).limit(10).catch(() => []),
    ]);

    // Calculate birthdays in the current month
    const currentMonth = today.getMonth();
    const birthdays = (allStudentsWithDob || [])
      .filter((s: any) => {
        if (!s.dateOfBirth) return false;
        const dob = new Date(s.dateOfBirth);
        return dob.getMonth() === currentMonth;
      })
      .map((s: any) => ({
        _id: s._id,
        name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student',
        date: s.dateOfBirth,
        grade: s.grade,
      }))
      .sort((a: any, b: any) => new Date(a.date).getDate() - new Date(b.date).getDate())
      .slice(0, 10);

    const totalCollected = feesCollectedAggregation && feesCollectedAggregation.length > 0 ? (feesCollectedAggregation[0]?.total || 0) : 0;
    const totalPending = feesPendingAggregation && feesPendingAggregation.length > 0 ? (feesPendingAggregation[0]?.total || 0) : 0;
    const totalOverdue = feesOverdueAggregation && feesOverdueAggregation.length > 0 ? (feesOverdueAggregation[0]?.total || 0) : 0;
    const totalTarget = totalCollected + totalPending + totalOverdue;

    const totalMarkedAttendance = studentAttendancePresent + studentAttendanceAbsent + studentAttendanceLate;
    const attendanceRate =
      totalMarkedAttendance > 0
        ? Number(((studentAttendancePresent / totalMarkedAttendance) * 100).toFixed(1))
        : 0;

    // Transform recent activities from audit logs or admissions
    const recentActivities = (recentAuditLogs || []).map((log: any) => ({
      id: log._id?.toString() || Math.random().toString(),
      title: log.action || 'System Action',
      detail: `${log.entity || ''} ${log.entityId ? `#${String(log.entityId).slice(-4)}` : ''}`.trim(),
      time: log.timestamp || log.createdAt || new Date().toISOString(),
      type: (log.entity || 'general').toLowerCase(),
    }));

    res.json({
      isParentPortal: false,
      isTeacherPortal: false,
      totalStudents,
      totalStaff,
      pendingAdmissions,
      newAdmissions,
      feeCollectionSummary: totalCollected,
      feeStats: {
        collected: totalCollected,
        pending: totalPending,
        overdue: totalOverdue,
        target: totalTarget,
      },
      feesDue: feesPendingList || [],
      attendanceSummary: {
        studentsPresent: studentAttendancePresent,
        studentsAbsent: studentAttendanceAbsent,
        studentsLate: studentAttendanceLate,
        attendanceRate,
        staffPresent: staffAttendanceToday,
        staffTotal: totalStaff,
      },
      admissionPipeline: {
        enquiries: admissionInquiries,
        applications: pendingAdmissions,
        interviews: admissionInterviews,
        approved: admissionsApproved,
        confirmed: newAdmissions,
      },
      todaySchedule: [],
      recentAdmissions: (recentAdmissionsList || []).map((a: any) => ({
        id: a._id?.toString() || Math.random().toString(),
        name: `${a.childFirstName || ''} ${a.childLastName || ''}`.trim() || a.applicantName || 'Applicant',
        admissionNumber: a.applicationNumber || `GGPS-ADM-${(a._id?.toString() || '').slice(-4)}`,
        grade: a.gradeAppliedFor || 'LKG',
        parent: a.parentName || 'Parent',
        status: a.status || 'New Inquiry',
        date: a.createdAt || new Date().toISOString(),
      })),
      recentActivities,
      upcomingEvents: upcomingEvents || [],
      birthdays,
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.json({
      isParentPortal: false,
      isTeacherPortal: false,
      totalStudents: 0,
      totalStaff: 0,
      pendingAdmissions: 0,
      newAdmissions: 0,
      feeCollectionSummary: 0,
      feeStats: { collected: 0, pending: 0, overdue: 0, target: 0 },
      feesDue: [],
      attendanceSummary: {
        studentsPresent: 0,
        studentsAbsent: 0,
        studentsLate: 0,
        attendanceRate: 0,
        staffPresent: 0,
        staffTotal: 0,
      },
      admissionPipeline: {
        enquiries: 0,
        applications: 0,
        interviews: 0,
        approved: 0,
        confirmed: 0,
      },
      todaySchedule: [],
      recentAdmissions: [],
      recentActivities: [],
      upcomingEvents: [],
      birthdays: [],
    });
  }
};
