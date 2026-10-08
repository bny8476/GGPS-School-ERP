import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admission from '../models/Admission';
import Student from '../models/Student';
import Enrollment from '../models/Enrollment';
import AcademicYear from '../models/AcademicYear';
import Class from '../models/Class';
import Section from '../models/Section';
import Parent from '../models/Parent';
import StudentParent from '../models/StudentParent';
import User from '../models/User';
import Role from '../models/Role';
import Notification from '../models/Notification';
import AdmissionEnquiry from '../models/AdmissionEnquiry';
import AuditLog from '../models/AuditLog';
import {
  generateNextAdmissionNumber,
  generateNextEnquiryNumber,
  generateNextStudentID,
  generateNextRollNumber,
} from '../services/sequenceService';
import { emailService } from '../services/emailService';
import { emitToRole, emitToUser, broadcastEvent } from '../socket';
import { escapeRegex } from '../utils/sanitizers';
import { normalizePhoneNumber } from '../validators/commonValidators';

// @desc    Get all admissions (with search, filter, pagination)
// @route   GET /api/admissions
export const getAdmissions = async (req: Request, res: Response) => {
  try {
    const { stage, status, search, page, limit } = req.query;
    const filter: Record<string, any> = {};

    if (stage) filter.stage = stage;
    if (status) filter.status = status;

    if (search) {
      const searchRegex = new RegExp(escapeRegex(String(search).trim()), 'i');
      filter.$or = [
        { childFirstName: searchRegex },
        { childLastName: searchRegex },
        { parentName: searchRegex },
        { applicationNumber: searchRegex },
        { enquiryReference: searchRegex },
        { email: searchRegex },
        { contactNumber: searchRegex },
      ];
    }

    if (page) {
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [admissions, total] = await Promise.all([
        Admission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        Admission.countDocuments(filter),
      ]);

      return res.status(200).json({
        success: true,
        data: admissions,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    }

    const admissions = await Admission.find(filter).sort({ createdAt: -1 });
    res.status(200).json(admissions);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error fetching admissions', error });
  }
};

// @desc    Create an enquiry/admission (Supports both flat and nested { student, parent } payloads)
// @route   POST /api/admissions or POST /api/v1/admissions/enquiries
export const createAdmission = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};

    // Normalize payload
    let parentName = String(body.parentName || body.parent?.name || '').trim();
    let contactNumber = String(body.phone || body.contactNumber || body.parentPhone || body.parent?.contactNumber || body.parent?.phone || '').trim();
    let email = String(body.email || body.parentEmail || body.parent?.email || '').trim().toLowerCase();
    let relationship = String(body.relationship || body.parentRelationship || 'Parent').trim();

    let childFirstName = String(body.childFirstName || body.student?.firstName || '').trim();
    let childLastName = String(body.childLastName || body.student?.lastName || '').trim();
    if (!childFirstName && body.childName) {
      const parts = String(body.childName).trim().split(/\s+/);
      childFirstName = parts[0] || '';
      childLastName = parts.slice(1).join(' ') || '-';
    }

    let dateOfBirth = body.dateOfBirth || body.student?.dateOfBirth;
    let gender = body.gender || body.student?.gender || 'Other';
    let gradeAppliedFor = String(body.classApplied || body.gradeAppliedFor || body.student?.gradeAppliedFor || body.class || '').trim();
    let academicYear = String(body.academicYear || '2026–2027').trim();
    let preferredContactMethod = String(body.preferredContactMethod || 'Phone').trim();
    let message = String(body.message || body.notes || '').trim();

    if (!parentName || !contactNumber || !childFirstName || !gradeAppliedFor) {
      return res.status(400).json({
        success: false,
        message: 'Missing required admission fields (parentName, phone, childName, classApplied)',
      });
    }

    // Generate unique official identifier
    const isApplication = body.stage !== 'Enquiry';
    const appNumber = body.applicationNumber || (isApplication 
      ? await generateNextAdmissionNumber(academicYear, gradeAppliedFor) 
      : await generateNextEnquiryNumber(academicYear));
    const enquiryReference = appNumber;

    const admission = await Admission.create({
      applicationNumber: appNumber,
      enquiryReference: isApplication ? (body.enquiryReference || appNumber) : appNumber,
      childFirstName,
      childMiddleName: body.childMiddleName || body.student?.middleName || '',
      childLastName: childLastName || '-',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender: ['Male', 'Female', 'Other'].includes(gender) ? gender : 'Other',
      parentName,
      fatherName: body.fatherName || body.parent?.fatherName || '',
      motherName: body.motherName || body.parent?.motherName || '',
      guardianName: body.guardianName || body.parent?.guardianName || '',
      relationship,
      contactNumber,
      parentPhone: contactNumber,
      email: email || undefined,
      parentEmail: email || undefined,
      address: body.address || body.parent?.address || '',
      gradeAppliedFor,
      academicYear,
      preferredContactMethod,
      status: body.status || (isApplication ? 'Submitted' : 'New'),
      stage: body.stage || (isApplication ? 'Application' : 'Enquiry'),
      notes: message,
      previousSchool: body.previousSchool || '',
      previousClass: body.previousClass || '',
      previousAcademicYear: body.previousAcademicYear || '',
      tcAvailable: !!body.tcAvailable,
      medicalNotes: body.medicalNotes || '',
      source: body.source || 'Website',
      referral: body.referral || '',
      documents: body.documents || [],
      feeStatus: body.feeStatus || 'Pending',
      feeAmount: body.feeAmount !== undefined ? Number(body.feeAmount) : 25000,
      feePaid: body.feePaid !== undefined ? Number(body.feePaid) : 0,
    });

    // Notify administrators via realtime socket
    emitToRole('Admin', 'admission:new', admission);
    broadcastEvent('notification:new', {
      type: 'admission',
      title: isApplication ? 'New Admission Application Submitted' : 'New Admission Enquiry Received',
      message: `${isApplication ? 'Application' : 'Enquiry'} ${appNumber} received for ${childFirstName} ${childLastName !== '-' ? childLastName : ''} (${gradeAppliedFor})`,
      enquiryReference: appNumber,
      applicationNumber: appNumber,
    });

    // Create persistent Notification in database for Admin role
    await Notification.create({
      title: 'New Admission Enquiry Received',
      message: `New admission enquiry ${enquiryReference} received for ${childFirstName} ${childLastName !== '-' ? childLastName : ''} (${gradeAppliedFor}) from ${parentName} (${contactNumber})`,
      type: 'admission',
      targetRole: 'Admin',
      priority: 'high',
      read: false,
      deliveryStatus: 'Delivered',
      link: '/dashboard/admissions?tab=pipeline',
      metadata: {
        admissionId: admission._id,
        applicationNumber: enquiryReference,
        enquiryReference,
        childName: `${childFirstName} ${childLastName !== '-' ? childLastName : ''}`.trim(),
        gradeAppliedFor,
        parentName,
        phone: contactNumber,
      },
    }).catch((err) => console.warn('Admin notification create notice:', err));

    // Send parent acknowledgement email when email is provided
    if (email && email.includes('@')) {
      emailService.sendEmail({
        to: email,
        subject: 'GGPS School — Admission Enquiry Received',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5EEFF; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #0757D5; margin: 0; font-size: 24px;">GGPS School</h1>
              <p style="color: #61708A; font-size: 14px; margin-top: 4px;">Excellence in Early Childhood &amp; Elementary Education</p>
            </div>
            <div style="padding: 20px; background-color: #F8FAFF; border-radius: 12px; margin-bottom: 20px; border: 1px solid #E2E8F0;">
              <h2 style="color: #07152F; font-size: 18px; margin-top: 0;">Admission Enquiry Received</h2>
              <p style="color: #0B1833; font-size: 15px; line-height: 1.6;">Dear <strong>${parentName}</strong>,</p>
              <p style="color: #0B1833; font-size: 15px; line-height: 1.6;">
                Thank you for contacting <strong>GGPS School</strong>. We have received your admission enquiry for <strong>${childFirstName} ${childLastName !== '-' ? childLastName : ''}</strong> (${gradeAppliedFor}, Academic Year ${academicYear}) and our admissions team will contact you shortly via <strong>${preferredContactMethod}</strong>.
              </p>
              <div style="margin: 20px 0; padding: 12px 16px; background: #E5EEFF; border-radius: 8px; font-weight: bold; color: #0757D5; font-size: 15px;">
                Enquiry Reference: ${enquiryReference}
              </div>
            </div>
            <p style="color: #61708A; font-size: 13px;">If you have any questions, feel free to reply directly or contact our admissions office at <a href="mailto:admissions@ggps.edu" style="color: #0757D5;">admissions@ggps.edu</a>.</p>
            <div style="border-top: 1px solid #E5EEFF; margin-top: 24px; padding-top: 16px; text-align: center; color: #94A3B8; font-size: 12px;">
              &copy; ${new Date().getFullYear()} GGPS School. All rights reserved.
            </div>
          </div>
        `,
        text: `Thank you for contacting GGPS School. We have received your admission enquiry (${enquiryReference}) and our admissions team will contact you shortly.`,
      }).catch((err) => console.warn('Parent acknowledgement email notice:', err));
    }

    res.status(201).json({
      success: true,
      message: 'Admission enquiry submitted successfully',
      enquiryReference,
      applicationNumber: enquiryReference,
      data: admission,
      admission,
    });
  } catch (error) {
    console.error('Create admission error:', error);
    res.status(400).json({ success: false, message: 'Invalid admission data', error });
  }
};

// @desc    Approve admission and convert to Student + Enrollment + Parent account
// @route   POST /api/admissions/:id/approve
export const approveAdmission = async (req: Request, res: Response) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission record not found' });
    }

    // 1. Resolve Academic Year
    let activeYear = await AcademicYear.findOne({ isCurrent: true });
    if (!activeYear) {
      activeYear = await AcademicYear.findOne().sort({ createdAt: -1 });
    }
    if (!activeYear) {
      activeYear = await AcademicYear.create({
        name: '2026-2027',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
        status: 'active',
        isCurrent: true,
      });
    }

    // 2. Resolve Class
    const className = admission.gradeAppliedFor || 'LKG';
    let classDoc = await Class.findOne({ name: new RegExp(`^${className}$`, 'i') });
    if (!classDoc) {
      classDoc = await Class.create({ name: className });
    }

    // 3. Resolve Section
    const sectionName = req.body.sectionName || 'A';
    let sectionDoc = await Section.findOne({ classId: classDoc._id, name: new RegExp(`^${sectionName}$`, 'i') });
    if (!sectionDoc) {
      sectionDoc = await Section.create({ name: sectionName, classId: classDoc._id, capacity: 30 });
    }

    const yearStr = activeYear.name || '2026-27';

    // 4. Find or Create Parent User & Parent Profile
    let parentUser = await User.findOne({ email: admission.email });
    if (!parentUser) {
      let parentRole = await Role.findOne({ name: 'Parent' });
      if (!parentRole) {
        parentRole = await Role.create({ name: 'Parent', permissions: ['child:read', 'attendance:read', 'diary:read', 'fees:read'] });
      }

      const defaultPass = 'Welcome@123';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(defaultPass, salt);

      const nameParts = admission.parentName.split(' ');
      const pFirst = nameParts[0] || 'Parent';
      const pLast = nameParts.slice(1).join(' ') || 'Guardian';

      parentUser = await User.create({
        firstName: pFirst,
        lastName: pLast,
        email: admission.email,
        passwordHash,
        role: parentRole._id,
        phoneNumber: admission.contactNumber,
        isActive: true,
        status: 'Active',
      });
    }

    let parentDoc = await Parent.findOne({ $or: [{ userId: parentUser._id }, { primaryEmail: admission.email }] });
    if (!parentDoc) {
      parentDoc = await Parent.create({
        userId: parentUser._id,
        fatherName: admission.parentName,
        motherName: 'Mother',
        primaryEmail: admission.email,
        address: admission.address || 'Address',
        fatherContact: admission.contactNumber,
        whatsappNumber: admission.contactNumber,
      });
    }

    // 5. Generate Authoritative Unique Identifiers
    const studentId = await generateNextStudentID(yearStr, className);
    const rawAdm = admission.applicationNumber || (await generateNextAdmissionNumber(yearStr, className));
    const admissionNumber = String(rawAdm).replace(/-/g, '');
    const rollNumber = await generateNextRollNumber(yearStr, className, sectionName);

    // 6. Create Student Record
    const student = await Student.create({
      studentId,
      admissionNumber,
      firstName: admission.childFirstName,
      lastName: admission.childLastName,
      gender: admission.gender || 'Other',
      dateOfBirth: admission.dateOfBirth,
      grade: className,
      classId: classDoc._id,
      sectionId: sectionDoc._id,
      parentId: parentDoc._id,
      emergencyContact: admission.contactNumber,
      enrollmentDate: new Date(),
      status: 'Active',
    });

    // 7. Create Enrollment Record
    const enrollment = await Enrollment.create({
      studentId: student._id,
      academicYearId: activeYear._id,
      classId: classDoc._id,
      sectionId: sectionDoc._id,
      rollNumber,
      admissionDate: new Date(),
      status: 'Active',
    });

    // 8. Link StudentParent Junction
    await StudentParent.findOneAndUpdate(
      { studentId: student._id, parentId: parentDoc._id },
      {
        studentId: student._id,
        parentId: parentDoc._id,
        relationship: 'Guardian',
        isPrimary: true,
      },
      { upsert: true }
    );

    // 9. Update Admission Stage
    admission.status = 'Admission Confirmed';
    admission.stage = 'Enrolled';
    admission.studentId = student._id;
    await admission.save();

    // 10. Send Welcome Notification to Parent
    await Notification.create({
      recipient: parentUser._id,
      userId: parentUser._id,
      studentId: student._id,
      targetRole: 'Parent',
      title: 'Admission Approved!',
      message: `Congratulations! ${student.firstName} ${student.lastName} has been officially enrolled into ${className} (Section ${sectionName}). Admission No: ${admissionNumber}`,
      type: 'admission',
      priority: 'high',
      link: '/parent',
      metadata: {
        studentId: student._id,
        admissionNumber,
        rollNumber,
        className,
        sectionName,
      },
    });

    emitToUser(parentUser._id.toString(), 'notification:new', {
      type: 'admission',
      message: `Admission Confirmed: ${student.firstName} has been enrolled!`,
    });
    emitToRole('Admin', 'student:created', { student, enrollment });

    res.status(200).json({
      success: true,
      message: `Admission approved successfully! Student created with Admission No: ${admissionNumber}`,
      student,
      enrollment,
      admissionNumber,
      rollNumber,
      parent: parentDoc,
      parentUser: {
        _id: parentUser._id,
        email: parentUser.email,
      },
    });
  } catch (error) {
    console.error('Approve admission error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve admission', error });
  }
};

// @desc    Update admission stage/details
// @route   PUT /api/admissions/:id
export const updateAdmission = async (req: Request, res: Response) => {
  try {
    const {
      childFirstName,
      childLastName,
      childMiddleName,
      dateOfBirth,
      gender,
      parentName,
      fatherName,
      motherName,
      guardianName,
      contactNumber,
      parentPhone,
      email,
      parentEmail,
      address,
      gradeAppliedFor,
      status,
      stage,
      interviewDate,
      interviewNotes,
      admissionScore,
      waitlistPosition,
      notes,
      documents,
      feeStatus,
      feeAmount,
      feePaid,
      paymentMethod,
      receiptNumber,
      medicalNotes,
      previousSchool,
      previousClass,
      previousAcademicYear,
      tcAvailable,
      source,
      referral,
    } = req.body;

    const allowedUpdates: Record<string, any> = {};
    if (childFirstName !== undefined) allowedUpdates.childFirstName = childFirstName;
    if (childMiddleName !== undefined) allowedUpdates.childMiddleName = childMiddleName;
    if (childLastName !== undefined) allowedUpdates.childLastName = childLastName;
    if (dateOfBirth !== undefined) allowedUpdates.dateOfBirth = dateOfBirth;
    if (gender !== undefined) allowedUpdates.gender = gender;
    if (parentName !== undefined) allowedUpdates.parentName = parentName;
    if (fatherName !== undefined) allowedUpdates.fatherName = fatherName;
    if (motherName !== undefined) allowedUpdates.motherName = motherName;
    if (guardianName !== undefined) allowedUpdates.guardianName = guardianName;
    if (contactNumber !== undefined) allowedUpdates.contactNumber = contactNumber;
    if (parentPhone !== undefined) allowedUpdates.parentPhone = parentPhone;
    if (email !== undefined) allowedUpdates.email = email;
    if (parentEmail !== undefined) allowedUpdates.parentEmail = parentEmail;
    if (address !== undefined) allowedUpdates.address = address;
    if (gradeAppliedFor !== undefined) allowedUpdates.gradeAppliedFor = gradeAppliedFor;
    if (status !== undefined) allowedUpdates.status = status;
    if (stage !== undefined) allowedUpdates.stage = stage;
    if (interviewDate !== undefined) allowedUpdates.interviewDate = interviewDate;
    if (interviewNotes !== undefined) allowedUpdates.interviewNotes = interviewNotes;
    if (admissionScore !== undefined) allowedUpdates.admissionScore = admissionScore;
    if (waitlistPosition !== undefined) allowedUpdates.waitlistPosition = waitlistPosition;
    if (notes !== undefined) allowedUpdates.notes = notes;
    if (medicalNotes !== undefined) allowedUpdates.medicalNotes = medicalNotes;
    if (previousSchool !== undefined) allowedUpdates.previousSchool = previousSchool;
    if (previousClass !== undefined) allowedUpdates.previousClass = previousClass;
    if (previousAcademicYear !== undefined) allowedUpdates.previousAcademicYear = previousAcademicYear;
    if (tcAvailable !== undefined) allowedUpdates.tcAvailable = tcAvailable;
    if (source !== undefined) allowedUpdates.source = source;
    if (referral !== undefined) allowedUpdates.referral = referral;
    if (documents !== undefined) allowedUpdates.documents = documents;
    if (feeStatus !== undefined) allowedUpdates.feeStatus = feeStatus;
    if (feeAmount !== undefined) allowedUpdates.feeAmount = Number(feeAmount);
    if (feePaid !== undefined) allowedUpdates.feePaid = Number(feePaid);
    if (paymentMethod !== undefined) allowedUpdates.paymentMethod = paymentMethod;
    if (receiptNumber !== undefined) allowedUpdates.receiptNumber = receiptNumber;

    const admission = await Admission.findByIdAndUpdate(req.params.id, allowedUpdates, {
      new: true,
      runValidators: true,
    });

    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission record not found' });
    }

    // Auto-approve if status explicitly changed to 'Admission Confirmed' or stage to 'Enrolled' and studentId not yet created
    if ((allowedUpdates.status === 'Admission Confirmed' || allowedUpdates.stage === 'Enrolled') && !admission.studentId) {
      return approveAdmission(req, res);
    }

    res.status(200).json(admission);
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid update data', error });
  }
};

// =========================================================================
// ENQUIRY WORKFLOW (Public Website → Admin Workspace)
// =========================================================================

// @desc    Public submission of admission enquiry with duplicate detection and atomic sequence ID
// @route   POST /api/v1/admissions/enquiries
export const createEnquiry = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};

    const parentName = String(body.parentName || body.parent?.name || '').trim();
    const rawPhone = String(body.phone || body.contactNumber || body.parent?.phone || '').trim();
    const phone = String(normalizePhoneNumber(rawPhone) || rawPhone).trim();
    const rawEmail = String(body.email || body.parent?.email || '').trim().toLowerCase();
    const email = rawEmail || undefined;
    const relationship = String(body.relationship || body.parent?.relationship || 'Parent').trim();

    let childName = String(body.childName || body.child?.name || '').trim();
    if (!childName && (body.childFirstName || body.student?.firstName)) {
      const first = String(body.childFirstName || body.student?.firstName || '').trim();
      const last = String(body.childLastName || body.student?.lastName || '').trim();
      childName = `${first} ${last}`.trim();
    }

    const parseSafeDate = (d: any): Date | undefined => {
      if (!d) return undefined;
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    };

    const dateOfBirth = parseSafeDate(body.dateOfBirth || body.child?.dateOfBirth);
    const gender = body.gender || body.child?.gender || 'Other';
    const classApplied = String(body.classApplied || body.gradeAppliedFor || body.child?.classApplied || 'LKG').trim();
    const academicYear = String(body.academicYear || '2026–2027').trim();
    const preferredContactMethod = String(body.preferredContactMethod || 'Phone').trim();
    const message = String(body.message || body.notes || '').trim();
    const preferredVisitDate = parseSafeDate(body.preferredVisitDate);
    const source = String(body.source || 'Website').trim();

    // Server-side validation
    if (!parentName || !phone || !childName || !classApplied) {
      return res.status(400).json({
        success: false,
        message: 'Missing required admission enquiry fields (parentName, phone, childName, classApplied)',
      });
    }

    // 1. DUPLICATE ENQUIRY DETECTION (Same phone + child name + academic year OR email + child name + academic year)
    const childRegex = new RegExp(`^${childName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const duplicateQuery: any = {
      academicYear,
      'child.name': childRegex,
      $or: [
        { 'parent.phone': phone },
        ...(email ? [{ 'parent.email': email }] : []),
      ],
    };

    const existingEnquiry = await AdmissionEnquiry.findOne(duplicateQuery);
    if (existingEnquiry) {
      return res.status(409).json({
        success: false,
        isDuplicate: true,
        message: 'An enquiry for this child may already exist. Our admissions team will review it.',
        enquiryId: existingEnquiry.enquiryId,
        data: existingEnquiry,
      });
    }

    // 2. Concurrency-safe atomic sequence generation: GGPSENQ{YEAR}{0001}
    const enquiryId = await generateNextEnquiryNumber(academicYear);

    // 3. Persist in MongoDB
    const validContactMethod = ['Phone', 'WhatsApp', 'Email'].includes(preferredContactMethod)
      ? (preferredContactMethod as 'Phone' | 'WhatsApp' | 'Email')
      : 'Phone';
    const validSource = source || 'Website';

    const ALLOWED_STATUSES = [
      'NEW',
      'CONTACTED',
      'FOLLOW_UP',
      'QUALIFIED',
      'APPLICATION_STARTED',
      'CONVERTED',
      'CLOSED',
      'LOST',
      'New',
      'Contacted',
      'Follow-up',
      'Qualified',
      'Application Started',
      'Converted',
      'Closed',
    ];
    const initialStatus = ALLOWED_STATUSES.includes(body.status) ? body.status : 'NEW';
    const initialNotes = body.notes ? [{ text: String(body.notes).trim(), createdAt: new Date() }] : [];
    const followUpDate = parseSafeDate(body.followUpDate);

    const enquiry = await AdmissionEnquiry.create({
      enquiryId,
      academicYear,
      parent: {
        name: parentName,
        email: email || undefined,
        phone,
        relationship: relationship || 'Parent',
      },
      child: {
        name: childName,
        dateOfBirth,
        classApplied,
        gender: ['Male', 'Female', 'Other'].includes(gender) ? gender : 'Other',
      },
      preferredContactMethod: validContactMethod,
      message,
      preferredVisitDate,
      source: validSource,
      status: initialStatus,
      nextFollowUpDate: followUpDate,
      followUps: followUpDate
        ? [
            {
              date: followUpDate,
              notes: 'Initial follow-up scheduled during enquiry registration',
              type: 'Phone',
              createdAt: new Date(),
            },
          ]
        : [],
      notes: initialNotes,
    });

    // Also sync to Admission collection for pipeline compatibility
    const nameParts = childName.split(/\s+/);
    const resolvedFirstName = String(body.childFirstName || nameParts[0] || 'Child').trim();
    const resolvedLastName = String(body.childLastName || nameParts.slice(1).join(' ') || nameParts[0] || 'Student').trim();
    await Admission.create({
      applicationNumber: enquiryId,
      enquiryReference: enquiryId,
      childFirstName: resolvedFirstName,
      childLastName: resolvedLastName,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender: ['Male', 'Female', 'Other'].includes(gender) ? gender : 'Other',
      parentName,
      relationship,
      contactNumber: phone,
      parentPhone: phone,
      email: email || undefined,
      parentEmail: email || undefined,
      gradeAppliedFor: classApplied,
      academicYear,
      preferredContactMethod: validContactMethod,
      status: 'New',
      stage: 'Enquiry',
      notes: message,
    }).catch((err) => console.warn('Sync Admission record notice:', err));

    // 4. Audit Log
    await AuditLog.create({
      action: 'ENQUIRY_CREATED',
      module: 'ADMISSION_ENQUIRY',
      targetId: enquiryId,
      details: `Admission enquiry ${enquiryId} submitted for ${childName} (${classApplied}) by ${parentName}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
    }).catch((err) => console.warn('AuditLog error:', err));

    // 5. Emit Real-time Socket.IO notification to Admin console
    emitToRole('Admin', 'admission:enquiry:new', enquiry);
    emitToRole('Admin', 'admission:new', enquiry);
    broadcastEvent('notification:new', {
      type: 'admission',
      title: 'New Admission Enquiry',
      message: `New enquiry received from ${parentName} for ${childName} (${classApplied})`,
      enquiryId,
      link: '/dashboard/admissions?tab=inquiries',
    });

    // 6. Create in-app Notification for Admin role
    await Notification.create({
      title: 'New Admission Enquiry Received',
      message: `New enquiry ${enquiryId} received from ${parentName} for ${childName} (${classApplied})`,
      type: 'admission',
      targetRole: 'Admin',
      priority: 'high',
      read: false,
      deliveryStatus: 'Delivered',
      link: '/dashboard/admissions?tab=inquiries',
      metadata: {
        enquiryId,
        parentName,
        childName,
        classApplied,
        phone,
      },
    }).catch((err) => console.warn('Notification create notice:', err));

    // 7. Parent Email Acknowledgement
    if (email && email.includes('@')) {
      emailService.sendEmail({
        to: email,
        subject: 'GGPS School — Admission Enquiry Received',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E5EEFF; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #0050CB; margin: 0; font-size: 24px;">GGPS School</h1>
              <p style="color: #61708A; font-size: 14px; margin-top: 4px;">Excellence in Early Childhood &amp; Elementary Education</p>
            </div>
            <div style="padding: 20px; background-color: #F8FAFF; border-radius: 12px; margin-bottom: 20px; border: 1px solid #E2E8F0;">
              <h2 style="color: #000E28; font-size: 18px; margin-top: 0;">Enquiry Submitted Successfully</h2>
              <p style="color: #0B1833; font-size: 15px; line-height: 1.6;">Dear <strong>${parentName}</strong>,</p>
              <p style="color: #0B1833; font-size: 15px; line-height: 1.6;">
                Thank you for contacting <strong>GGPS School</strong>. We have received your admission enquiry for <strong>${childName}</strong> (${classApplied}, Academic Year ${academicYear}) and our admissions team will contact you shortly via <strong>${validContactMethod}</strong>.
              </p>
              <div style="margin: 20px 0; padding: 12px 16px; background: #E5EEFF; border-radius: 8px; font-weight: bold; color: #0050CB; font-size: 15px;">
                Your Enquiry ID: ${enquiryId}
              </div>
            </div>
            <p style="color: #61708A; font-size: 13px;">If you have any questions, reply to this email or reach us at <a href="mailto:admissions@ggps.edu" style="color: #0050CB;">admissions@ggps.edu</a>.</p>
            <div style="border-top: 1px solid #E5EEFF; margin-top: 24px; padding-top: 16px; text-align: center; color: #94A3B8; font-size: 12px;">
              &copy; ${new Date().getFullYear()} GGPS School. All rights reserved.
            </div>
          </div>
        `,
        text: `Thank you for contacting GGPS School. We have received your admission enquiry (${enquiryId}) and our admissions team will contact you shortly.`,
      }).catch((err) => console.warn('Parent email notice:', err));
    }

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      enquiryId,
      enquiryReference: enquiryId,
      applicationNumber: enquiryId,
      data: enquiry,
    });
  } catch (error: any) {
    console.error('Create enquiry error:', error);
    const message = error?.message || 'Invalid enquiry data';
    res.status(400).json({ success: false, message, error });
  }
};

// @desc    Get enquiry by enquiryId (Public tracking or staff verification)
// @route   GET /api/v1/admissions/enquiries/:enquiryId
export const getEnquiryById = async (req: Request, res: Response) => {
  try {
    const { enquiryId } = req.params;
    const cleanId = String(enquiryId || '').trim();
    const cleanIdWithoutHyphens = cleanId.replace(/-/g, '');
    const enquiry = await AdmissionEnquiry.findOne({
      $or: [
        { enquiryId: cleanId },
        { enquiryId: cleanIdWithoutHyphens },
        { _id: mongoose.isValidObjectId(cleanId) ? cleanId : null },
      ],
    });

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry record not found' });
    }

    if (enquiry.enquiryId) {
      enquiry.enquiryId = enquiry.enquiryId.replace(/-/g, '');
    }

    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving enquiry', error });
  }
};

// @desc    Admin list enquiries with KPI counts, server-side search, filters, pagination
// @route   GET /api/v1/admissions/enquiries
export const getEnquiries = async (req: Request, res: Response) => {
  try {
    const { status, classApplied, academicYear, source, assignedTo, search, page, limit, startDate, endDate } = req.query;
    const filter: Record<string, any> = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (classApplied && classApplied !== 'ALL') {
      filter['child.classApplied'] = classApplied;
    }
    if (academicYear && academicYear !== 'ALL') {
      filter.academicYear = academicYear;
    }
    if (source && source !== 'ALL') {
      filter.source = source;
    }
    if (assignedTo && assignedTo !== 'ALL') {
      if (assignedTo === 'UNASSIGNED') {
        filter['assignedTo.id'] = { $exists: false };
      } else {
        filter['assignedTo.id'] = assignedTo;
      }
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(String(startDate));
      if (endDate) {
        const end = new Date(String(endDate));
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Self-heal legacy enquiries with hyphens in DB
    try {
      const legacyWithHyphens = await AdmissionEnquiry.find({ enquiryId: /-/ }).limit(50);
      for (const enq of legacyWithHyphens) {
        enq.enquiryId = enq.enquiryId.replace(/-/g, '');
        await enq.save().catch(() => {});
      }
    } catch {
      // Continue gracefully
    }

    if (search) {
      const q = String(search).trim();
      const qClean = q.replace(/-/g, '');
      const searchRegex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const cleanRegex = new RegExp(qClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { enquiryId: searchRegex },
        { enquiryId: cleanRegex },
        { 'parent.name': searchRegex },
        { 'parent.phone': searchRegex },
        { 'parent.email': searchRegex },
        { 'child.name': searchRegex },
      ];
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Auto-seed initial enquiries if collection is completely empty
    const countCheck = await AdmissionEnquiry.countDocuments({});
    if (countCheck === 0) {
      const seedYear = '2026–2027';
      await AdmissionEnquiry.create([
        {
          enquiryId: 'GGPSENQ20260001',
          academicYear: seedYear,
          parent: { name: 'Rahul Kumar', email: 'rahul.kumar@gmail.com', phone: '+91 98401 22334', relationship: 'Father' },
          child: { name: 'Arun Kumar', classApplied: 'LKG', dateOfBirth: new Date('2022-04-15'), gender: 'Male' },
          preferredContactMethod: 'Phone',
          message: 'Interested in LKG admission for AY 2026-27. Inquiring about school curriculum and timing.',
          source: 'Website',
          status: 'NEW',
          followUps: [],
          notes: [],
        },
        {
          enquiryId: 'GGPSENQ20260002',
          academicYear: seedYear,
          parent: { name: 'Pooja Chopra', email: 'pooja.c@example.com', phone: '+91 98223 99881', relationship: 'Mother' },
          child: { name: 'Reyansh Chopra', classApplied: 'PreKG', dateOfBirth: new Date('2023-08-10'), gender: 'Male' },
          preferredContactMethod: 'WhatsApp',
          message: 'Would like to visit the campus on Saturday morning.',
          source: 'Home Page',
          status: 'CONTACTED',
          lastContactAt: new Date(Date.now() - 86400000),
          lastContactMethod: 'WhatsApp',
          followUps: [],
          notes: [{ text: 'Called parent; very receptive. Invited to campus tour.', createdAt: new Date() }],
        },
        {
          enquiryId: 'GGPSENQ20260003',
          academicYear: seedYear,
          parent: { name: 'Amit Bhasin', email: 'amit.bhasin@example.com', phone: '+91 99114 77665', relationship: 'Father' },
          child: { name: 'Samaira Bhasin', classApplied: 'UKG', dateOfBirth: new Date('2021-01-20'), gender: 'Female' },
          preferredContactMethod: 'Phone',
          message: 'Transfer from Bangalore. Requesting curriculum details.',
          source: 'Admission Page',
          status: 'FOLLOW_UP',
          nextFollowUpDate: new Date(Date.now() + 86400000 * 2),
          followUps: [{ date: new Date(), type: 'Phone', notes: 'Scheduled demo class on Friday', createdAt: new Date() }],
          notes: [],
        },
        {
          enquiryId: 'GGPSENQ20260004',
          academicYear: seedYear,
          parent: { name: 'Farhan Siddiqui', email: 'farhan.s@example.com', phone: '+91 97110 55443', relationship: 'Father' },
          child: { name: 'Zoya Siddiqui', classApplied: 'PreKG', dateOfBirth: new Date('2023-05-18'), gender: 'Female' },
          preferredContactMethod: 'Email',
          message: 'Confirmed admission application documents submitted.',
          source: 'Referral',
          status: 'CONVERTED',
          conversion: { applicationNumber: 'APP-2026-0001', convertedAt: new Date() },
          followUps: [],
          notes: [],
        },
      ]);
    }

    const [enquiries, total, totalAll, newCount, contactedCount, followUpCount, convertedCount, closedCount] = await Promise.all([
      AdmissionEnquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      AdmissionEnquiry.countDocuments(filter),
      AdmissionEnquiry.countDocuments({}),
      AdmissionEnquiry.countDocuments({ status: 'NEW' }),
      AdmissionEnquiry.countDocuments({ status: 'CONTACTED' }),
      AdmissionEnquiry.countDocuments({ status: 'FOLLOW_UP' }),
      AdmissionEnquiry.countDocuments({ status: 'CONVERTED' }),
      AdmissionEnquiry.countDocuments({ status: 'CLOSED' }),
    ]);

    const kpiData = {
      total: totalAll,
      new: newCount,
      contacted: contactedCount,
      followUp: followUpCount,
      converted: convertedCount,
      closed: closedCount,
    };

    const sanitizedEnquiries = enquiries.map((enq: any) => {
      const obj = enq.toObject ? enq.toObject() : { ...enq };
      if (obj.enquiryId) obj.enquiryId = String(obj.enquiryId).replace(/-/g, '');
      return obj;
    });

    res.status(200).json({
      success: true,
      data: sanitizedEnquiries,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      kpis: kpiData,
      metrics: kpiData,
    });
  } catch (error) {
    console.error('Fetch enquiries error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching enquiries', error });
  }
};

// @desc    Admin detail view of a single enquiry
// @route   GET /api/v1/admissions/enquiries/detail/:id
export const getEnquiryDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cleanId = String(id || '').trim();
    const cleanIdClean = cleanId.replace(/-/g, '');
    const enquiry = await AdmissionEnquiry.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(cleanId) ? cleanId : null },
        { enquiryId: cleanId },
        { enquiryId: cleanIdClean },
      ],
    });

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry record not found' });
    }

    if (enquiry.enquiryId) {
      enquiry.enquiryId = enquiry.enquiryId.replace(/-/g, '');
    }

    const userObj = (req as any).user;
    await AuditLog.create({
      userId: userObj?._id,
      userName: `${userObj?.firstName || 'Admin'} ${userObj?.lastName || ''}`.trim(),
      userRole: userObj?.role?.name || userObj?.role || 'Admin',
      action: 'ENQUIRY_VIEWED',
      module: 'ADMISSION_ENQUIRY',
      targetId: enquiry.enquiryId,
      details: `Enquiry ${enquiry.enquiryId} viewed by staff`,
    }).catch(() => {});

    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving enquiry detail', error });
  }
};

// @desc    Admin update enquiry fields
// @route   PATCH /api/v1/admissions/enquiries/:id
export const updateEnquiry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const allowedUpdates: Record<string, any> = {};
    if (body.parentName) allowedUpdates['parent.name'] = body.parentName.trim();
    if (body.phone) allowedUpdates['parent.phone'] = body.phone.trim();
    if (body.email) allowedUpdates['parent.email'] = body.email.trim().toLowerCase();
    if (body.relationship) allowedUpdates['parent.relationship'] = body.relationship.trim();

    if (body.childName) allowedUpdates['child.name'] = body.childName.trim();
    if (body.classApplied) allowedUpdates['child.classApplied'] = body.classApplied.trim();
    if (body.dateOfBirth) allowedUpdates['child.dateOfBirth'] = new Date(body.dateOfBirth);
    if (body.gender) allowedUpdates['child.gender'] = body.gender;

    if (body.preferredContactMethod) allowedUpdates.preferredContactMethod = body.preferredContactMethod;
    if (body.preferredVisitDate) allowedUpdates.preferredVisitDate = new Date(body.preferredVisitDate);
    if (body.message !== undefined) allowedUpdates.message = body.message.trim();
    if (body.source) allowedUpdates.source = body.source;

    const enquiry = await AdmissionEnquiry.findOneAndUpdate(
      { $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { enquiryId: id }] },
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry record not found' });
    }

    const userObj = (req as any).user;
    await AuditLog.create({
      userId: userObj?._id,
      userName: `${userObj?.firstName || 'Admin'} ${userObj?.lastName || ''}`.trim(),
      userRole: userObj?.role?.name || userObj?.role || 'Admin',
      action: 'ENQUIRY_UPDATED',
      module: 'ADMISSION_ENQUIRY',
      targetId: enquiry.enquiryId,
      details: `Enquiry ${enquiry.enquiryId} updated`,
    }).catch(() => {});

    emitToRole('Admin', 'admission:enquiry:updated', enquiry);

    res.status(200).json({ success: true, message: 'Enquiry updated successfully', data: enquiry });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid enquiry update data', error });
  }
};

// @desc    Admin update enquiry status (NEW → CONTACTED → FOLLOW_UP → CONVERTED / CLOSED)
// @route   PATCH /api/v1/admissions/enquiries/:id/status
export const updateEnquiryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, contactMethod } = req.body;

    const validStatuses = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'CLOSED', 'LOST'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    const enquiry = await AdmissionEnquiry.findOne({
      $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { enquiryId: id }],
    });

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry record not found' });
    }

    const oldStatus = enquiry.status;
    enquiry.status = status;

    if (status === 'CONTACTED') {
      enquiry.lastContactAt = new Date();
      enquiry.lastContactMethod = contactMethod || enquiry.preferredContactMethod || 'Phone';
    }

    await enquiry.save();

    const userObj = (req as any).user;
    await AuditLog.create({
      userId: userObj?._id,
      userName: `${userObj?.firstName || 'Admin'} ${userObj?.lastName || ''}`.trim(),
      userRole: userObj?.role?.name || userObj?.role || 'Admin',
      action: 'STATUS_CHANGED',
      module: 'ADMISSION_ENQUIRY',
      targetId: enquiry.enquiryId,
      details: `Status changed from ${oldStatus} to ${status}`,
    }).catch(() => {});

    emitToRole('Admin', 'admission:enquiry:status-changed', { enquiryId: enquiry.enquiryId, status, oldStatus, enquiry });
    broadcastEvent('admission:enquiry:status-changed', { enquiryId: enquiry.enquiryId, status });

    res.status(200).json({ success: true, message: `Status updated to ${status}`, data: enquiry });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating status', error });
  }
};

// @desc    Admin assign staff to enquiry
// @route   PATCH /api/v1/admissions/enquiries/:id/assignment
export const assignEnquiry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, name, email, role } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ success: false, message: 'Staff userId and name are required' });
    }

    const enquiry = await AdmissionEnquiry.findOne({
      $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { enquiryId: id }],
    });

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry record not found' });
    }

    enquiry.assignedTo = {
      id: new mongoose.Types.ObjectId(userId),
      name: String(name).trim(),
      email: String(email || '').trim(),
      role: String(role || 'Admissions Staff').trim(),
    };
    await enquiry.save();

    const userObj = (req as any).user;
    await AuditLog.create({
      userId: userObj?._id,
      userName: `${userObj?.firstName || 'Admin'} ${userObj?.lastName || ''}`.trim(),
      userRole: userObj?.role?.name || userObj?.role || 'Admin',
      action: 'ENQUIRY_ASSIGNED',
      module: 'ADMISSION_ENQUIRY',
      targetId: enquiry.enquiryId,
      details: `Enquiry ${enquiry.enquiryId} assigned to ${name}`,
    }).catch(() => {});

    emitToRole('Admin', 'admission:enquiry:assigned', { enquiryId: enquiry.enquiryId, assignedTo: enquiry.assignedTo });
    broadcastEvent('admission:enquiry:assigned', { enquiryId: enquiry.enquiryId, assignedTo: enquiry.assignedTo });

    res.status(200).json({ success: true, message: `Assigned to ${name}`, data: enquiry });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error assigning staff', error });
  }
};

// @desc    Admin record follow-up on enquiry
// @route   POST /api/v1/admissions/enquiries/:id/follow-ups
export const addEnquiryFollowUp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, time, type, notes } = req.body;

    if (!date || !notes) {
      return res.status(400).json({ success: false, message: 'Follow-up date and notes are required' });
    }

    const enquiry = await AdmissionEnquiry.findOne({
      $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { enquiryId: id }],
    });

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry record not found' });
    }

    const userObj = (req as any).user;
    const followUpDate = new Date(date);

    enquiry.followUps.push({
      date: followUpDate,
      time: time || undefined,
      type: ['Phone', 'WhatsApp', 'Email', 'Visit', 'Other'].includes(type) ? type : 'Phone',
      notes: String(notes).trim(),
      createdBy: {
        id: userObj?._id,
        name: `${userObj?.firstName || 'Admin'} ${userObj?.lastName || ''}`.trim(),
        email: userObj?.email,
      },
      createdAt: new Date(),
    });

    enquiry.nextFollowUpDate = followUpDate;
    if (enquiry.status === 'NEW' || enquiry.status === 'CONTACTED') {
      enquiry.status = 'FOLLOW_UP';
    }

    await enquiry.save();

    await AuditLog.create({
      userId: userObj?._id,
      userName: `${userObj?.firstName || 'Admin'} ${userObj?.lastName || ''}`.trim(),
      userRole: userObj?.role?.name || userObj?.role || 'Admin',
      action: 'FOLLOW_UP_CREATED',
      module: 'ADMISSION_ENQUIRY',
      targetId: enquiry.enquiryId,
      details: `Follow-up scheduled for ${followUpDate.toLocaleDateString()}: ${notes}`,
    }).catch(() => {});

    emitToRole('Admin', 'admission:enquiry:follow-up-created', { enquiryId: enquiry.enquiryId, enquiry });

    res.status(201).json({ success: true, message: 'Follow-up scheduled successfully', data: enquiry });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error adding follow-up', error });
  }
};

// @desc    Admin add internal note to enquiry
// @route   POST /api/v1/admissions/enquiries/:id/notes
export const addEnquiryNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !String(text).trim()) {
      return res.status(400).json({ success: false, message: 'Note text cannot be empty' });
    }

    const enquiry = await AdmissionEnquiry.findOne({
      $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { enquiryId: id }],
    });

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry record not found' });
    }

    const userObj = (req as any).user;
    enquiry.notes.push({
      text: String(text).trim(),
      createdBy: {
        id: userObj?._id,
        name: `${userObj?.firstName || 'Admin'} ${userObj?.lastName || ''}`.trim(),
        email: userObj?.email,
      },
      createdAt: new Date(),
    });

    await enquiry.save();

    await AuditLog.create({
      userId: userObj?._id,
      userName: `${userObj?.firstName || 'Admin'} ${userObj?.lastName || ''}`.trim(),
      userRole: userObj?.role?.name || userObj?.role || 'Admin',
      action: 'NOTE_ADDED',
      module: 'ADMISSION_ENQUIRY',
      targetId: enquiry.enquiryId,
      details: `Internal note added to enquiry ${enquiry.enquiryId}`,
    }).catch(() => {});

    res.status(201).json({ success: true, message: 'Note added successfully', data: enquiry });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error adding note', error });
  }
};

// @desc    Convert Enquiry to formal Admission Application
// @route   POST /api/v1/admissions/enquiries/:id/convert
export const convertEnquiryToApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const enquiry = await AdmissionEnquiry.findOne({
      $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { enquiryId: id }],
    });

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry record not found' });
    }

    if (enquiry.status === 'CONVERTED') {
      return res.status(400).json({
        success: false,
        message: 'This enquiry has already been converted to an application.',
        conversion: enquiry.conversion,
      });
    }

    if (enquiry.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        message: 'Closed enquiries cannot be converted. Please reopen enquiry first.',
      });
    }

    const yearStr = enquiry.academicYear || '2026–2027';
    const applicationNumber = await generateNextAdmissionNumber(yearStr, enquiry.child.classApplied);

    const nameParts = enquiry.child.name.trim().split(/\s+/);
    const childFirstName = nameParts[0] || 'Student';
    const childLastName = nameParts.slice(1).join(' ') || nameParts[0] || 'Student';

    // 1. Create formal Admission application record
    const application = await Admission.create({
      applicationNumber,
      enquiryReference: enquiry.enquiryId,
      childFirstName,
      childLastName,
      dateOfBirth: enquiry.child.dateOfBirth,
      gender: enquiry.child.gender || 'Other',
      parentName: enquiry.parent.name,
      relationship: enquiry.parent.relationship || 'Parent',
      contactNumber: enquiry.parent.phone,
      parentPhone: enquiry.parent.phone,
      email: enquiry.parent.email,
      parentEmail: enquiry.parent.email,
      gradeAppliedFor: enquiry.child.classApplied,
      academicYear: enquiry.academicYear,
      preferredContactMethod: enquiry.preferredContactMethod,
      status: 'Application Received',
      stage: 'Application',
      notes: enquiry.message,
    });

    // 2. Mark enquiry as CONVERTED
    const userObj = (req as any).user;
    enquiry.status = 'CONVERTED';
    enquiry.conversion = {
      applicationId: application._id,
      applicationNumber,
      convertedAt: new Date(),
      convertedBy: {
        id: userObj?._id,
        name: `${userObj?.firstName || 'Admin'} ${userObj?.lastName || ''}`.trim(),
      },
    };
    await enquiry.save();

    // 3. Audit Log
    await AuditLog.create({
      userId: userObj?._id,
      userName: `${userObj?.firstName || 'Admin'} ${userObj?.lastName || ''}`.trim(),
      userRole: userObj?.role?.name || userObj?.role || 'Admin',
      action: 'CONVERTED_TO_APPLICATION',
      module: 'ADMISSION_ENQUIRY',
      targetId: enquiry.enquiryId,
      details: `Enquiry ${enquiry.enquiryId} converted to formal application ${applicationNumber}`,
    }).catch(() => {});

    emitToRole('Admin', 'admission:enquiry:converted', { enquiry, application });
    broadcastEvent('admission:enquiry:converted', { enquiryId: enquiry.enquiryId, applicationNumber });

    res.status(200).json({
      success: true,
      message: 'Enquiry converted to application successfully',
      enquiry,
      application,
      applicationNumber,
    });
  } catch (error) {
    console.error('Convert enquiry error:', error);
    res.status(500).json({ success: false, message: 'Server error converting enquiry to application', error });
  }
};

// @desc    Close enquiry (parent not interested / lost / invalid)
// @route   POST /api/v1/admissions/enquiries/:id/close
export const closeEnquiry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const enquiry = await AdmissionEnquiry.findOne({
      $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { enquiryId: id }],
    });

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'Enquiry record not found' });
    }

    const oldStatus = enquiry.status;
    enquiry.status = 'CLOSED';
    if (reason) {
      const userObj = (req as any).user;
      enquiry.notes.push({
        text: `Closure reason: ${String(reason).trim()}`,
        createdBy: {
          id: userObj?._id,
          name: `${userObj?.firstName || 'Admin'} ${userObj?.lastName || ''}`.trim(),
          email: userObj?.email,
        },
        createdAt: new Date(),
      });
    }

    await enquiry.save();

    const userObj = (req as any).user;
    await AuditLog.create({
      userId: userObj?._id,
      userName: `${userObj?.firstName || 'Admin'} ${userObj?.lastName || ''}`.trim(),
      userRole: userObj?.role?.name || userObj?.role || 'Admin',
      action: 'ENQUIRY_CLOSED',
      module: 'ADMISSION_ENQUIRY',
      targetId: enquiry.enquiryId,
      details: `Enquiry ${enquiry.enquiryId} closed. Old status: ${oldStatus}. Reason: ${reason || 'None provided'}`,
    }).catch(() => {});

    emitToRole('Admin', 'admission:enquiry:closed', { enquiryId: enquiry.enquiryId, enquiry });

    res.status(200).json({ success: true, message: 'Enquiry closed successfully', data: enquiry });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error closing enquiry', error });
  }
};

