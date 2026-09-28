import { Request, Response } from 'express';
import Student from '../models/Student';
import AdmissionEnquiry from '../models/AdmissionEnquiry';
import Admission from '../models/Admission';
import Parent from '../models/Parent';
import User from '../models/User';
import Fee from '../models/Fee';
import Event from '../models/Event';

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const regex = new RegExp(q, 'i');
    const results: any[] = [];

    // 1. Search Students
    const students = await Student.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { admissionNumber: regex },
        { rollNumber: regex },
        { grade: regex },
      ],
    })
      .select('firstName lastName admissionNumber rollNumber grade _id')
      .limit(6);

    for (const s of students) {
      results.push({
        id: `st-${s._id}`,
        title: `${s.firstName} ${s.lastName || ''}`.trim(),
        subtitle: `${s.admissionNumber || 'No ID'} • Class ${s.grade || 'N/A'}${s.rollNumber ? ` • Roll #${s.rollNumber}` : ''}`,
        category: 'Students',
        href: `/dashboard/students`,
        icon: 'GraduationCap',
      });
    }

    // 2. Search Admission Enquiries
    const enquiries = await AdmissionEnquiry.find({
      $or: [
        { enquiryId: regex },
        { 'child.name': regex },
        { 'parent.name': regex },
        { 'parent.phone': regex },
        { 'parent.email': regex },
      ],
    })
      .select('enquiryId child parent status _id')
      .limit(5);

    for (const enq of enquiries) {
      const childName = enq.child?.name || 'Applicant';
      const parentName = enq.parent?.name || 'Parent';
      const className = enq.child?.classApplied || 'LKG';
      results.push({
        id: `enq-${enq._id}`,
        title: `${enq.enquiryId}: ${childName}`,
        subtitle: `Parent: ${parentName} • Status: ${enq.status} • Class: ${className}`,
        category: 'Admissions',
        href: `/dashboard/admissions/enquiries`,
        icon: 'Sparkles',
      });
    }

    // 3. Search Formal Admissions
    const admissions = await Admission.find({
      $or: [
        { admissionNumber: regex },
        { childName: regex },
        { parentName: regex },
      ],
    })
      .select('admissionNumber childName parentName status grade _id')
      .limit(4);

    for (const adm of admissions) {
      results.push({
        id: `adm-${adm._id}`,
        title: `${adm.admissionNumber || 'Application'}: ${adm.childName}`,
        subtitle: `Parent: ${adm.parentName || 'N/A'} • Status: ${adm.status || 'Active'}`,
        category: 'Admissions',
        href: `/dashboard/admissions`,
        icon: 'UserCheck',
      });
    }

    // 4. Search Parents
    const parents = await Parent.find({
      $or: [
        { fatherName: regex },
        { motherName: regex },
        { primaryEmail: regex },
        { fatherContact: regex },
        { motherContact: regex },
      ],
    })
      .select('fatherName motherName primaryEmail fatherContact _id')
      .limit(4);

    for (const p of parents) {
      results.push({
        id: `pr-${p._id}`,
        title: `${p.fatherName || p.motherName || 'Parent Guardian'}`,
        subtitle: `${p.primaryEmail || p.fatherContact || 'Guardian Record'}`,
        category: 'Parents',
        href: `/dashboard/parents`,
        icon: 'Users',
      });
    }

    // 5. Search Teachers & Staff
    const staffUsers = await User.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
      ],
    })
      .populate('role', 'name')
      .select('firstName lastName email role _id')
      .limit(4);

    for (const u of staffUsers) {
      const roleName = (u.role as any)?.name || 'Staff';
      if (roleName !== 'Parent') {
        results.push({
          id: `usr-${u._id}`,
          title: `${u.firstName} ${u.lastName || ''}`.trim(),
          subtitle: `${roleName} • ${u.email}`,
          category: 'Teachers',
          href: `/dashboard/teachers`,
          icon: 'Briefcase',
        });
      }
    }

    // 6. Search Finance / Invoices
    const fees = await Fee.find({
      $or: [
        { invoiceNumber: regex },
        { receiptNumber: regex },
        { title: regex },
        { feeType: regex },
      ],
    })
      .select('invoiceNumber title totalAmount status feeType _id')
      .limit(4);

    for (const f of fees) {
      results.push({
        id: `fee-${f._id}`,
        title: `${f.invoiceNumber || 'Invoice'}: ${f.title || f.feeType}`,
        subtitle: `₹${(f.totalAmount || 0).toLocaleString('en-IN')} • Status: ${f.status || 'Pending'}`,
        category: 'Finance',
        href: `/dashboard/fees`,
        icon: 'DollarSign',
      });
    }

    // 7. Search Events
    const events = await Event.find({
      $or: [{ title: regex }, { description: regex }],
    })
      .select('title date category _id')
      .limit(3);

    for (const ev of events) {
      results.push({
        id: `ev-${ev._id}`,
        title: ev.title,
        subtitle: `${new Date(ev.date).toLocaleDateString()} • ${ev.category || 'Event'}`,
        category: 'Events',
        href: `/dashboard/events`,
        icon: 'Calendar',
      });
    }

    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Global search error', error: error.message });
  }
};
