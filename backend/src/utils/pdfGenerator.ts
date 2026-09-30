import { Response } from 'express';
import PDFDocument from 'pdfkit';

export interface PayslipData {
  month: string;
  status: string;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  paymentDate?: Date | string;
  staffId?: {
    firstName?: string;
    lastName?: string;
  };
}

export interface RubricData {
  category: string;
  skill: string;
  score: string;
}

export interface AssessmentData {
  term: string;
  date: Date | string;
  rubrics: RubricData[];
  teacherComments: string;
}

export interface StudentPDFData {
  firstName: string;
  lastName: string;
  admissionNumber?: string;
  className?: string;
  section?: string;
  dateOfBirth?: Date | string;
}

/**
 * Utility to generate a PDF for a Salary Payslip
 */
export const generatePayslipPDF = (res: Response, payrollData: PayslipData) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  const cleanFilename = `GGPS-Salary-Payslip-${payrollData.month.replace(/\s+/g, '_')}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
  doc.pipe(res);

  // Header Banner
  doc.rect(50, 45, 495, 60).fill('#0050CB');
  doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold').text('GGPS SCHOOL', 50, 58, { align: 'center', width: 495 });
  doc.fillColor('#E5EEFF').fontSize(9).font('Helvetica').text('Excellence in Early Childhood & Primary Education • CBSE Affiliated', 50, 82, { align: 'center', width: 495 });

  doc.moveDown(4);

  // Title
  doc.fillColor('#000E28').fontSize(16).font('Helvetica-Bold').text('OFFICIAL SALARY PAYSLIP', { align: 'center' });
  doc.moveDown(1.5);

  // Staff Details Box
  const staffY = doc.y;
  doc.roundedRect(50, staffY, 495, 75, 8).stroke('#CBD5E1');
  doc.fontSize(10).font('Helvetica-Bold').fillColor('#0050CB').text('EMPLOYEE CREDENTIALS', 65, staffY + 12);
  doc.font('Helvetica').fillColor('#000E28');
  doc.text(`Employee Name: ${payrollData.staffId?.firstName || 'Staff'} ${payrollData.staffId?.lastName || ''}`, 65, staffY + 30);
  doc.text(`Pay Period: ${payrollData.month}`, 65, staffY + 45);
  doc.text(`Disbursement Status: ${payrollData.status}`, 320, staffY + 30);
  if (payrollData.paymentDate) {
    doc.text(`Disbursement Date: ${new Date(payrollData.paymentDate).toLocaleDateString('en-GB')}`, 320, staffY + 45);
  }

  doc.y = staffY + 95;

  // Salary Breakdown Table
  const tableTop = doc.y;
  const leftCol = 65;
  const rightCol = 430;

  doc.rect(50, tableTop, 495, 24).fill('#F1F5F9');
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#000E28').text('EARNINGS & DEDUCTIONS', leftCol, tableTop + 7);
  doc.text('AMOUNT (INR)', rightCol, tableTop + 7, { align: 'right', width: 100 });

  doc.y = tableTop + 35;
  doc.font('Helvetica').fontSize(10).fillColor('#334155');

  doc.text('Base Basic Salary', leftCol, doc.y);
  doc.text(`Rs. ${Number(payrollData.baseSalary || 0).toLocaleString('en-IN')}`, rightCol, doc.y, { align: 'right', width: 100 });
  doc.moveDown(0.7);

  doc.text('Special & Travel Allowances', leftCol, doc.y);
  doc.text(`+ Rs. ${Number(payrollData.bonuses || 0).toLocaleString('en-IN')}`, rightCol, doc.y, { align: 'right', width: 100 });
  doc.moveDown(0.7);

  doc.text('Statutory PF & Tax Deductions', leftCol, doc.y);
  doc.text(`- Rs. ${Number(payrollData.deductions || 0).toLocaleString('en-IN')}`, rightCol, doc.y, { align: 'right', width: 100 });
  doc.moveDown(1);

  // Net Pay Accent Row
  const netY = doc.y;
  doc.rect(50, netY, 495, 30).fill('#E5EEFF');
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#0050CB').text('NET PAYABLE SALARY:', leftCol, netY + 9);
  doc.text(`Rs. ${Number(payrollData.netSalary || 0).toLocaleString('en-IN')}`, rightCol, netY + 9, { align: 'right', width: 100 });

  // Footer
  doc.y = 730;
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E2E8F0');
  doc.moveDown(0.5);
  doc.font('Helvetica').fontSize(8).fillColor('#64748B').text('This is a verified computer-generated statement issued by GGPS Accounts Directorate. No physical signature required.', { align: 'center' });

  doc.end();
};

/**
 * Utility to generate a PDF for an Official Fee Invoice
 */
export const generateFeeInvoicePDF = (res: Response, invoice: any) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  const invoiceNo = invoice.invoiceNumber || `INV-${String(invoice._id).slice(-6)}`;
  const cleanFilename = `GGPS-Fee-Invoice-${invoiceNo}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
  doc.pipe(res);

  // School Header
  doc.rect(50, 45, 495, 60).fill('#0050CB');
  doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold').text('GGPS SCHOOL', 50, 58, { align: 'center', width: 495 });
  doc.fillColor('#E5EEFF').fontSize(9).font('Helvetica').text('Plot 42, Knowledge Avenue • Affiliated to CBSE • finance@ggps.edu', 50, 82, { align: 'center', width: 495 });

  doc.y = 125;

  // Invoice Title and Status
  doc.fillColor('#000E28').fontSize(16).font('Helvetica-Bold').text('TAX INVOICE / STUDENT FEE BILL', 50, doc.y);
  doc.moveDown(0.4);

  const statusColor = invoice.status === 'Paid' ? '#10B981' : invoice.status === 'Partial' ? '#F59E0B' : '#EF4444';
  doc.font('Helvetica-Bold').fontSize(10).fillColor(statusColor).text(`STATUS: ${String(invoice.status || 'Pending').toUpperCase()}`, 50, doc.y);
  doc.moveDown(1);

  // Meta Information Grid
  const metaY = doc.y;
  doc.roundedRect(50, metaY, 240, 80, 8).stroke('#CBD5E1');
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#0050CB').text('INVOICE DETAILS', 62, metaY + 10);
  doc.font('Helvetica').fontSize(8.5).fillColor('#000E28');
  doc.text(`Invoice No: ${invoiceNo}`, 62, metaY + 26);
  doc.text(`Issue Date: ${new Date(invoice.createdAt || Date.now()).toLocaleDateString('en-GB')}`, 62, metaY + 40);
  doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-GB') : 'Immediate'}`, 62, metaY + 54);

  const student = invoice.studentId || {};
  const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Enrolled Student';

  doc.roundedRect(305, metaY, 240, 80, 8).stroke('#CBD5E1');
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#0050CB').text('BILLED TO (STUDENT)', 317, metaY + 10);
  doc.font('Helvetica').fontSize(8.5).fillColor('#000E28');
  doc.text(`Name: ${studentName}`, 317, metaY + 26);
  doc.text(`Adm No: ${student.admissionNumber || student.studentId || 'GGPS-STU'}`, 317, metaY + 40);
  doc.text(`Grade / Class: ${invoice.grade || student.grade || 'Primary'}`, 317, metaY + 54);

  doc.y = metaY + 100;

  // Fee Particulars Table
  const tableY = doc.y;
  doc.rect(50, tableY, 495, 24).fill('#000E28');
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
  doc.text('DESCRIPTION / PARTICULARS', 65, tableY + 7);
  doc.text('AMOUNT (INR)', 430, tableY + 7, { align: 'right', width: 100 });

  doc.y = tableY + 34;
  doc.font('Helvetica').fontSize(9.5).fillColor('#334155');

  const feeType = invoice.feeType || invoice.title || 'Tuition & Academic Facility Fee';
  doc.text(feeType, 65, doc.y);
  doc.text(`Rs. ${Number(invoice.totalAmount || 0).toLocaleString('en-IN')}`, 430, doc.y, { align: 'right', width: 100 });

  doc.moveDown(1.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E2E8F0');
  doc.moveDown(0.8);

  // Totals Breakdown
  const totalAmount = Number(invoice.totalAmount || 0);
  const amountPaid = Number(invoice.amountPaid || 0);
  const balanceDue = Math.max(0, totalAmount - amountPaid);

  const totalsY = doc.y;
  doc.text('Total Invoice Value:', 300, totalsY);
  doc.text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, 430, totalsY, { align: 'right', width: 100 });

  doc.text('Amount Received:', 300, totalsY + 16);
  doc.fillColor('#10B981').text(`Rs. ${amountPaid.toLocaleString('en-IN')}`, 430, totalsY + 16, { align: 'right', width: 100 });

  doc.rect(295, totalsY + 36, 250, 26).fill('#E5EEFF');
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#0050CB').text('OUTSTANDING BALANCE:', 305, totalsY + 44);
  doc.text(`Rs. ${balanceDue.toLocaleString('en-IN')}`, 430, totalsY + 44, { align: 'right', width: 100 });

  // Bank & UPI Instructions
  doc.y = totalsY + 80;
  doc.roundedRect(50, doc.y, 495, 65, 8).stroke('#E2E8F0');
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#FF690C').text('PAYMENT INSTRUCTIONS & REMITTANCE', 65, doc.y + 10);
  doc.font('Helvetica').fontSize(8).fillColor('#475569');
  doc.text('Bank: HDFC Bank Ltd • A/C Name: GGPS School Educational Trust • A/C No: 50200088921134', 65, doc.y + 24);
  doc.text('IFSC Code: HDFC0001244 • UPI ID: ggps.finance@hdfcbank • Remit with Invoice Number in remarks.', 65, doc.y + 36);

  // Footer
  doc.y = 740;
  doc.font('Helvetica').fontSize(8).fillColor('#94A3B8').text('This is an official computer-generated fee invoice issued by GGPS School Administration.', { align: 'center' });

  doc.end();
};

/**
 * Utility to generate a PDF for an Official Fee Payment Receipt
 */
export const generatePaymentReceiptPDF = (res: Response, receipt: any) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  const receiptNo = receipt.receiptNumber || `REC-${String(receipt._id || Date.now()).slice(-6)}`;
  const cleanFilename = `GGPS-Fee-Receipt-${receiptNo}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
  doc.pipe(res);

  // Header Banner
  doc.rect(50, 45, 495, 65).fill('#0050CB');
  doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('GGPS SCHOOL', 50, 56, { align: 'center', width: 495 });
  doc.fillColor('#E5EEFF').fontSize(9).font('Helvetica').text('Recognized Institution • Affiliated to CBSE • New Delhi', 50, 82, { align: 'center', width: 495 });
  doc.fillColor('#FF690C').fontSize(8.5).font('Helvetica-Bold').text('OFFICIAL PAYMENT ACKNOWLEDGEMENT RECEIPT', 50, 95, { align: 'center', width: 495 });

  doc.y = 130;

  // Receipt Credentials Box
  const boxY = doc.y;
  doc.roundedRect(50, boxY, 495, 75, 8).stroke('#CBD5E1');
  doc.rect(50, boxY, 495, 22).fill('#F8FAFC');
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#000E28').text('TRANSACTION RECEIPT RECORD', 65, boxY + 6);

  doc.font('Helvetica').fontSize(9).fillColor('#334155');
  doc.text(`Receipt Number: ${receiptNo}`, 65, boxY + 30);
  doc.text(`Payment Date: ${new Date(receipt.paidAt || Date.now()).toLocaleDateString('en-GB')}`, 65, boxY + 48);

  doc.text(`Payment Mode: ${receipt.paymentMethod || 'Online / UPI'}`, 320, boxY + 30);
  doc.text(`Transaction Ref: ${receipt.transactionId || 'TXN-DIRECT-SETTLED'}`, 320, boxY + 48);

  doc.y = boxY + 95;

  // Student Details
  const student = receipt.studentId || {};
  const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';

  const stuY = doc.y;
  doc.roundedRect(50, stuY, 495, 60, 8).stroke('#CBD5E1');
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#0050CB').text('STUDENT CREDENTIALS', 65, stuY + 10);
  doc.font('Helvetica').fontSize(9).fillColor('#000E28');
  doc.text(`Student Name: ${studentName}`, 65, stuY + 28);
  doc.text(`Admission No: ${student.admissionNumber || student.studentId || 'GGPS-STU'}`, 65, stuY + 42);
  doc.text(`Grade / Class: ${receipt.grade || student.grade || 'Primary'}`, 320, stuY + 28);

  doc.y = stuY + 80;

  // Payment Breakdown
  const tableY = doc.y;
  doc.rect(50, tableY, 495, 24).fill('#000E28');
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
  doc.text('FEE HEAD / PURPOSE', 65, tableY + 7);
  doc.text('AMOUNT RECEIVED', 430, tableY + 7, { align: 'right', width: 100 });

  doc.y = tableY + 35;
  doc.font('Helvetica').fontSize(10).fillColor('#334155');
  const purpose = receipt.feeType || receipt.title || 'Term Tuition & Facility Clearance';
  doc.text(purpose, 65, doc.y);
  doc.text(`Rs. ${Number(receipt.amount || receipt.amountPaid || 0).toLocaleString('en-IN')}`, 430, doc.y, { align: 'right', width: 100 });

  doc.moveDown(1.5);

  // Big Received Banner
  const amount = Number(receipt.amount || receipt.amountPaid || 0);
  const totalY = doc.y;
  doc.rect(50, totalY, 495, 36).fill('#E8FAF0');
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#10B981').text('TOTAL AMOUNT RECEIVED:', 65, totalY + 11);
  doc.text(`Rs. ${amount.toLocaleString('en-IN')}`, 430, totalY + 11, { align: 'right', width: 100 });

  // Verification Seal
  doc.y = totalY + 60;
  doc.roundedRect(360, doc.y, 185, 80, 8).stroke('#0050CB');
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#0050CB').text('GGPS BURSAR OFFICE', 370, doc.y + 12);
  doc.font('Helvetica').fontSize(7.5).fillColor('#64748B').text('Digitally Verified & Cleared', 370, doc.y + 26);
  doc.text(`Timestamp: ${new Date().toISOString()}`, 370, doc.y + 40);
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#10B981').text('STATUS: SETTLED', 370, doc.y + 58);

  // Footer
  doc.y = 740;
  doc.font('Helvetica').fontSize(8).fillColor('#94A3B8').text('This official receipt serves as valid tax-compliant proof of school fee payment.', { align: 'center' });

  doc.end();
};

/**
 * Universal Tabular Report PDF Generator
 */
export const generateReportExportPDF = (
  res: Response,
  title: string,
  columns: string[],
  rows: any[][]
) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });

  const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanFilename = `GGPS-Report-${safeTitle}-${new Date().toISOString().split('T')[0]}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
  doc.pipe(res);

  // Header Banner
  doc.rect(40, 30, 762, 45).fill('#0050CB');
  doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text('GGPS SCHOOL - ADMINISTRATIVE REPORTING CONSOLE', 40, 42, { align: 'center', width: 762 });
  doc.fillColor('#E5EEFF').fontSize(8.5).font('Helvetica').text(`Official Export: ${title} • Generated on ${new Date().toLocaleString('en-GB')}`, 40, 60, { align: 'center', width: 762 });

  doc.y = 90;

  // Table Dimensions
  const tableWidth = 762;
  const colCount = Math.max(1, columns.length);
  const colWidth = Math.floor(tableWidth / colCount);

  // Table Header
  doc.rect(40, doc.y, tableWidth, 22).fill('#000E28');
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');

  columns.forEach((col, idx) => {
    doc.text(col.toUpperCase(), 45 + idx * colWidth, doc.y + 6, { width: colWidth - 10, align: 'left' });
  });

  doc.y += 24;

  // Rows
  doc.font('Helvetica').fontSize(8).fillColor('#334155');
  let currentY = doc.y;

  rows.forEach((row, rowIdx) => {
    // Add page if near bottom
    if (currentY > 520) {
      doc.addPage({ margin: 40, size: 'A4', layout: 'landscape' });
      currentY = 40;
    }

    const isEven = rowIdx % 2 === 0;
    if (isEven) {
      doc.rect(40, currentY, tableWidth, 18).fill('#F8FAFC');
    }

    doc.fillColor('#334155');
    row.forEach((cell, colIdx) => {
      const cellText = cell !== undefined && cell !== null ? String(cell) : '-';
      doc.text(cellText, 45 + colIdx * colWidth, currentY + 4, {
        width: colWidth - 10,
        align: 'left',
        ellipsis: true,
      });
    });

    currentY += 18;
  });

  doc.end();
};

/**
 * Utility to generate a PDF for a Student Report Card
 */
export const generateReportCardPDF = (res: Response, student: StudentPDFData, assessments: AssessmentData[]) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  const cleanFilename = `GGPS-Report-Card-${student.firstName}-${student.lastName}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
  doc.pipe(res);

  // Header
  doc.rect(50, 45, 495, 60).fill('#0050CB');
  doc.fillColor('#FFFFFF').fontSize(22).font('Helvetica-Bold').text('GGPS SCHOOL', 50, 56, { align: 'center', width: 495 });
  doc.fillColor('#E5EEFF').fontSize(9).font('Helvetica').text('Early Childhood & Primary Academic Progress Portfolio', 50, 82, { align: 'center', width: 495 });

  doc.y = 125;

  // Title
  doc.fillColor('#000E28').fontSize(16).font('Helvetica-Bold').text('OFFICIAL STUDENT REPORT CARD', { align: 'center' });
  doc.moveDown(1.5);

  // Student Details Box
  const stuY = doc.y;
  doc.roundedRect(50, stuY, 495, 65, 8).stroke('#CBD5E1');
  doc.fontSize(9.5).fillColor('#000E28');
  doc.text(`Student Name: ${student.firstName} ${student.lastName}`, 65, stuY + 15);
  doc.text(`Admission No: ${student.admissionNumber || 'N/A'}`, 65, stuY + 32);
  doc.text(`Class & Section: ${student.className || 'N/A'} - ${student.section || 'A'}`, 320, stuY + 15);
  doc.text(`Date of Birth: ${student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}`, 320, stuY + 32);

  doc.y = stuY + 85;

  // Assessments
  if (assessments.length === 0) {
    doc.text('No formal assessments recorded for this student in current academic term.');
  } else {
    assessments.forEach((assessment) => {
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#0050CB').text(assessment.term);
      doc.font('Helvetica').fontSize(9).fillColor('#64748B').text(`Evaluation Date: ${new Date(assessment.date).toLocaleDateString('en-GB')}`);
      doc.moveDown(0.5);

      assessment.rubrics.forEach((rubric: RubricData) => {
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#000E28').text(rubric.category, 65, doc.y);
        doc.font('Helvetica').text(rubric.skill, 180, doc.y);
        doc.font('Helvetica-Bold').fillColor('#0050CB').text(rubric.score, 420, doc.y, { align: 'right' });
        doc.moveDown(0.4);
      });
      doc.moveDown(0.8);

      if (assessment.teacherComments) {
        doc.font('Helvetica-Bold').fillColor('#000E28').text('Faculty Remarks:');
        doc.font('Helvetica').fillColor('#475569').text(assessment.teacherComments, { indent: 15 });
        doc.moveDown(1.5);
      }
    });
  }

  // Footer
  doc.y = 740;
  doc.font('Helvetica').fontSize(8).fillColor('#94a3b8').text('This is an official computer-generated progress document authorized by GGPS Academic Directorate.', { align: 'center' });

  doc.end();
};
