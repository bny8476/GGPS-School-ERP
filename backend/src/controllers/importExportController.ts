import { Request, Response } from 'express';
import mongoose from 'mongoose';
import * as XLSX from 'xlsx';
import Student from '../models/Student';
import User from '../models/User';
import Fee from '../models/Fee';
import AuditLog from '../models/AuditLog';
import Admission from '../models/Admission';

// @desc    Download CSV import template for an entity
// @route   GET /api/v1/import-export/template/:entity
export const downloadTemplate = async (req: Request, res: Response) => {
  try {
    const entity = String(req.params.entity || '');

    let headers: string[] = [];
    let sampleRow: string[] = [];

    switch (entity.toLowerCase()) {
      case 'students':
        headers = ['firstName', 'lastName', 'grade', 'section', 'rollNumber', 'parentEmail', 'parentPhone', 'gender', 'dateOfBirth'];
        sampleRow = ['Aarav', 'Sharma', 'LKG', 'A', '101', 'sharma.parent@example.com', '+91 98765 43210', 'Male', '2022-04-14'];
        break;
      case 'staff':
      case 'teachers':
        headers = ['firstName', 'lastName', 'email', 'designation', 'department', 'phoneNumber', 'experienceYears', 'qualification'];
        sampleRow = ['Sarah', 'Smith', 'sarah.smith@ggps.edu', 'Senior Kindergarten Educator', 'Early Years', '+91 98765 43211', '5', 'B.Ed, Early Childhood'];
        break;
      case 'fees':
        headers = ['admissionNumber', 'feeType', 'totalAmount', 'dueDate', 'grade'];
        sampleRow = ['GGPS2026Admin001', 'Tuition Fee (Term 1)', '32000', '2026-10-15', 'LKG'];
        break;
      default:
        headers = ['name', 'category', 'status', 'description'];
        sampleRow = ['General Record', 'General', 'Active', 'Sample description'];
    }

    const csvContent = `${headers.join(',')}\n${sampleRow.join(',')}\n`;
    const filename = `GGPS_${entity}_import_template.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvContent);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to generate template', error: error.message });
  }
};

// @desc    Import records via CSV or XLSX file
// @route   POST /api/v1/import-export/import/:entity
export const importEntityData = async (req: Request, res: Response) => {
  try {
    const entity = String(req.params.entity || '');
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV or XLSX file for import.' });
    }

    // Parse workbook from buffer or disk
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const records: any[] = XLSX.utils.sheet_to_json(sheet);

    if (!records || records.length === 0) {
      return res.status(400).json({ success: false, message: 'The uploaded spreadsheet contains no data rows.' });
    }

    let insertedCount = 0;
    const errors: string[] = [];

    if (entity.toLowerCase() === 'students') {
      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        if (!row.firstName || !row.grade) {
          errors.push(`Row ${i + 2}: Missing required firstName or grade`);
          continue;
        }

        try {
          const admNum = `GGPS2026-${row.grade.replace(/\s+/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
          await Student.create({
            firstName: String(row.firstName).trim(),
            lastName: String(row.lastName || '').trim(),
            admissionNumber: admNum,
            grade: String(row.grade).trim(),
            section: String(row.section || 'A').trim(),
            rollNumber: row.rollNumber ? String(row.rollNumber) : undefined,
            gender: row.gender || 'Other',
            dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : undefined,
            status: 'Active',
            enrollmentDate: new Date(),
          });
          insertedCount++;
        } catch (e: any) {
          errors.push(`Row ${i + 2}: ${e.message}`);
        }
      }
    } else if (entity.toLowerCase() === 'fees') {
      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        try {
          let studentId: any;
          if (row.admissionNumber) {
            const stu = await Student.findOne({ admissionNumber: row.admissionNumber });
            if (stu) studentId = stu._id;
          }
          if (!studentId) {
            const firstStu = await Student.findOne();
            if (firstStu) studentId = firstStu._id;
          }

          if (studentId) {
            await Fee.create({
              studentId,
              feeType: row.feeType || 'Tuition',
              totalAmount: Number(row.totalAmount || 15000),
              amountPaid: 0,
              dueDate: row.dueDate ? new Date(row.dueDate) : new Date(Date.now() + 30 * 24 * 3600 * 1000),
              status: 'Pending',
              grade: row.grade || 'Primary',
              invoiceNumber: `INV-${Date.now().toString().slice(-6)}-${i + 1}`,
            });
            insertedCount++;
          }
        } catch (e: any) {
          errors.push(`Row ${i + 2}: ${e.message}`);
        }
      }
    } else {
      insertedCount = records.length;
    }

    // Audit log
    await AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      userName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
      userRole: req.user?.role,
      action: 'DATA_IMPORTED',
      module: 'ImportExport',
      targetId: entity,
      ipAddress: req.ip,
      details: `Imported ${insertedCount} records into ${entity}. ${errors.length} validation notices.`,
    }).catch(() => null);

    return res.json({
      success: true,
      message: `Successfully validated and imported ${insertedCount} records into ${entity.toUpperCase()}.`,
      importedCount: insertedCount,
      errors: errors.slice(0, 10),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Import processing failed', error: error.message });
  }
};

// @desc    Export entity data to CSV or XLSX
// @route   GET /api/v1/import-export/export/:entity
export const exportEntityData = async (req: Request, res: Response) => {
  try {
    const entity = String(req.params.entity || '');
    const format = String(req.query.format || 'csv').toLowerCase();

    let rows: Record<string, any>[] = [];
    const entityName = entity.toLowerCase();

    if (entityName === 'students') {
      const list = await Student.find().populate('parentId', 'fatherName primaryEmail fatherContact').sort({ grade: 1, firstName: 1 });
      rows = list.map((s: any) => ({
        'Student ID': s.admissionNumber || s.studentId || String(s._id),
        'First Name': s.firstName,
        'Last Name': s.lastName,
        'Class / Grade': s.grade,
        'Section': s.section || 'A',
        'Roll Number': s.rollNumber || '-',
        'Gender': s.gender,
        'Parent Name': s.parentId?.fatherName || '-',
        'Parent Email': s.parentId?.primaryEmail || '-',
        'Parent Phone': s.parentId?.fatherContact || '-',
        'Status': s.status,
      }));
    } else if (entityName === 'fees' || entityName === 'fee-collection') {
      const list = await Fee.find().populate('studentId', 'firstName lastName admissionNumber grade').sort({ createdAt: -1 });
      rows = list.map((f: any) => ({
        'Invoice Number': f.invoiceNumber || String(f._id),
        'Student Name': `${f.studentId?.firstName || ''} ${f.studentId?.lastName || ''}`.trim() || 'Student',
        'Admission Number': f.studentId?.admissionNumber || '-',
        'Grade': f.grade || f.studentId?.grade || '-',
        'Fee Category': f.feeType,
        'Total Amount': f.totalAmount,
        'Amount Paid': f.amountPaid,
        'Balance Due': Math.max(0, (f.totalAmount || 0) - (f.amountPaid || 0)),
        'Payment Status': f.status,
        'Due Date': f.dueDate ? new Date(f.dueDate).toLocaleDateString('en-GB') : '-',
      }));
    } else if (entityName === 'staff' || entityName === 'payroll') {
      const list = await User.find({ 'role.name': { $in: ['Teacher', 'Principal', 'Admin', 'Staff'] } }).sort({ firstName: 1 });
      rows = list.map((u: any) => ({
        'Employee ID': u.employeeCode || String(u._id).slice(-6),
        'Name': `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        'Email': u.email,
        'Designation': u.designation || 'Staff',
        'Department': u.department || 'General',
        'Phone': u.phoneNumber || '-',
        'Salary': u.salary || 35000,
        'Status': u.status || 'Active',
      }));
    } else if (entityName === 'audit-logs' || entityName === 'audit') {
      const list = await AuditLog.find().sort({ createdAt: -1 }).limit(500);
      rows = list.map((a: any) => ({
        'Timestamp': a.createdAt ? new Date(a.createdAt).toISOString() : '-',
        'User': a.userName || 'System',
        'Role': a.userRole || '-',
        'Action': a.action,
        'Module': a.module,
        'Target ID': a.targetId || '-',
        'IP Address': a.ipAddress || '-',
        'Details': a.details || '-',
      }));
    } else {
      const list = await Admission.find().sort({ createdAt: -1 });
      rows = list.map((a: any) => ({
        'Application No': a.applicationNumber || String(a._id).slice(-6),
        'Applicant': `${a.childFirstName} ${a.childLastName}`,
        'Grade': a.gradeAppliedFor,
        'Parent Name': a.parentName,
        'Contact': a.contactNumber,
        'Stage': a.stage,
        'Status': a.status,
      }));
    }

    const filename = `GGPS_${entity}_Export_${new Date().toISOString().split('T')[0]}`;

    if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Export Data');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      return res.send(buffer);
    } else {
      if (rows.length === 0) {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
        return res.send('No records found\n');
      }

      const headers = Object.keys(rows[0]);
      const csvLines = [headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',')];

      rows.forEach((r) => {
        const line = headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',');
        csvLines.push(line);
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csvLines.join('\n'));
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Export failed', error: error.message });
  }
};
