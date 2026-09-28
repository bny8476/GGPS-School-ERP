import { z } from 'zod';

export const markAttendanceSchema = z.object({
  body: z.object({
    date: z.string().or(z.date()),
    classId: z.string().optional(),
    sectionId: z.string().optional(),
    className: z.string().optional(),
    sectionName: z.string().optional(),
    academicYear: z.string().optional(),
    records: z.array(
      z.object({
        studentId: z.string().min(1, 'Student ID is required'),
        studentName: z.string().optional(),
        status: z.enum(['Present', 'Absent', 'Late', 'Excused', 'Half-Day']),
        checkInTime: z.string().optional(),
        absenceReason: z.string().optional(),
        teacherRemark: z.string().optional(),
        remarks: z.string().optional(),
      })
    ).min(1, 'At least one student attendance record is required'),
  }),
});
