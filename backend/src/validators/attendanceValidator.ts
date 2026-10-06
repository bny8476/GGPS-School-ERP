import { z } from 'zod';

export const markAttendanceSchema = z.object({
  body: z.object({
    date: z.string().or(z.date()),
    classId: z.string().trim().optional(),
    sectionId: z.string().trim().optional(),
    className: z.string().trim().optional(),
    sectionName: z.string().trim().optional(),
    academicYear: z.string().trim().optional(),
    records: z
      .array(
        z.object({
          studentId: z.string().trim().min(1, 'Student ID is required'),
          studentName: z.string().trim().optional(),
          status: z.enum(['Present', 'Absent', 'Late', 'Excused', 'Half-Day'], {
            message: 'Attendance status must be Present, Absent, Late, Excused, or Half-Day',
          }),
          checkInTime: z.string().trim().optional(),
          absenceReason: z.string().trim().max(300).optional(),
          teacherRemark: z.string().trim().max(300).optional(),
          remarks: z.string().trim().max(300).optional(),
        })
      )
      .min(1, 'At least one student attendance record is required'),
  }),
});
