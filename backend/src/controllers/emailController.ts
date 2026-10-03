import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Parent from '../models/Parent';
import Email, { IEmail } from '../models/Email';
import { emailService } from '../services/emailService';

// Pre-defined System Groups
export const RECIPIENT_GROUPS = [
  { id: 'all-parents', tag: '@All-Parents', label: 'All Parents & Guardians', count: 850, category: 'Parents' },
  { id: 'all-teachers', tag: '@All-Teachers', label: 'All Teaching Faculty', count: 24, category: 'Staff' },
  { id: 'ukg-faculty', tag: '@UKG-Faculty', label: 'UKG Faculty & Caregivers', count: 8, category: 'Staff' },
  { id: 'lkg-faculty', tag: '@LKG-Faculty', label: 'LKG Faculty & Caregivers', count: 8, category: 'Staff' },
  { id: 'pkg-faculty', tag: '@PreKG-Faculty', label: 'Pre-KG Faculty & Caregivers', count: 6, category: 'Staff' },
  { id: 'administration', tag: '@Administration', label: 'Senior Admin & Department Heads', count: 10, category: 'Admin' },
  { id: 'all-students', tag: '@All-Students', label: 'All Enrolled Students', count: 1240, category: 'Students' },
];

// Seeded Initial Mails for Inbox/Sent if DB is empty
const INITIAL_INBOX_MAILS: Partial<IEmail>[] = [
  {
    sender: 'Dr. Marcus Vance (Principal)',
    senderEmail: 'principal@globalinternationalschool.edu',
    recipients: ['superadmin@globalinternationalschool.edu'],
    subject: 'Annual Academic Audit & Review Meeting Schedule',
    preview: 'Dear Super Admin & Senior Leadership, Please note that the annual academic review meeting will be held this Friday in Conference Hall A...',
    body: `Dear Super Admin & Senior Leadership,

Please note that the annual academic review meeting will be convened this Friday at 10:00 AM in Conference Hall A. We will be reviewing:

1. Term 1 academic performance benchmarks across Grades 6–12.
2. Accreditation compliance checklist for international boards.
3. Budgetary allocations for the new STEAM innovation lab.

Please ensure all department reports are synchronized in the ERP beforehand.

Warm regards,
Dr. Marcus Vance
Principal | GGPS School`,
    category: 'general_notice',
    folder: 'inbox',
    priority: 'high',
    status: 'delivered',
    messageId: 'gis_inbox_001',
    starred: true,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    sender: 'Finance & Bursar Office',
    senderEmail: 'bursar@ggps.edu',
    recipients: ['superadmin@ggps.edu'],
    subject: 'Quarterly Term 2 Fee Reconciliation Summary',
    preview: 'The quarterly fee reconciliation for Q3 2026 has been generated. Total collections stand at 94.2%...',
    body: `Dear Administrator,

The fee reconciliation audit report for Term 2 has been prepared. Key highlights:

- Total Billed: $428,500.00
- Total Collected: $403,647.00 (94.2%)
- Outstanding Balance: $24,853.00 (primarily 28 student accounts)

We have pre-scheduled automated fee reminder dispatches for parents with pending dues starting next Monday.

Regards,
Accounting & Bursar Department
GGPS School`,
    category: 'fee_reminder',
    folder: 'inbox',
    priority: 'normal',
    status: 'delivered',
    messageId: 'gis_inbox_002',
    starred: false,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // yesterday
  },
  {
    sender: 'Eleanor Harrison (Parent)',
    senderEmail: 'e.harrison@gmail.com',
    recipients: ['admissions@ggps.edu', 'superadmin@ggps.edu'],
    subject: 'Inquiry regarding Pre-KG Kindergarten Admission',
    preview: 'Good morning, I would like to confirm receipt of Leo Harrison’s application dossier and schedule an orientation slot...',
    body: `Dear Admissions & Admin Team,

Good morning. I submitted the enrollment inquiry for my son Leo Harrison for Pre-KG last Tuesday.

Could you kindly confirm if the school tour and demo interaction schedule have been finalized?

Thank you for your assistance.

Best regards,
Eleanor Harrison
Parent of Leo Harrison (App ID: GGPS-ADM-2026-882)`,
    category: 'admission_letter',
    folder: 'inbox',
    priority: 'normal',
    status: 'delivered',
    messageId: 'gis_inbox_003',
    starred: false,
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
  },
];

// Fallback in-memory store if MongoDB is offline
let inMemoryEmails: any[] = [...INITIAL_INBOX_MAILS.map((m, idx) => ({ ...m, _id: `mem_mail_${idx + 1}` }))];

// Official School-Branded HTML Template Wrapper
export const wrapSchoolBrandedHtml = (title: string, category: string, bodyContent: string, footerNote?: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 20px; color: #000E28; }
    .container { max-width: 620px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0, 80, 203, 0.06); }
    .header { background: linear-gradient(135deg, #0050CB 0%, #000E28 100%); padding: 32px 28px; text-align: left; color: #FFFFFF; }
    .logo-badge { display: inline-block; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
    .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.85; }
    .accent-bar { height: 4px; background: #FF690C; }
    .content { padding: 32px 28px; font-size: 14px; line-height: 1.65; color: #1E293B; }
    .card-box { background: #E5EEFF; border-left: 4px solid #0050CB; border-radius: 8px; padding: 16px 20px; margin: 20px 0; font-size: 13px; }
    .footer { background: #F1F5F9; padding: 20px 28px; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0; text-align: center; line-height: 1.5; }
    .btn { display: inline-block; background: #0050CB; color: #FFFFFF !important; font-weight: 700; font-size: 13px; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-badge">GGPS School</div>
      <h1>Official Institutional Dispatch</h1>
      <p>${title}</p>
    </div>
    <div class="accent-bar"></div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <strong>GGPS School • Academic Administration Office</strong><br>
      Plot 42, Knowledge Avenue • Tel: +91 98765 43210 • admissions@ggps.edu<br>
      <em>${footerNote || 'This is an official administrative broadcast sent from the GGPS School ERP Portal.'}</em>
    </div>
  </div>
</body>
</html>
  `;
};

// Official Template Definitions
export const EMAIL_TEMPLATES = [
  {
    id: 'fee_reminder',
    name: 'Term Fee Due Notice',
    category: 'fee_reminder',
    badge: 'Finance Notice',
    subject: 'URGENT: Outstanding School Fee Notice for [Student Name] - Term 2',
    defaultBody: `Dear [Parent Name],

We hope this message finds you well.

This is a formal notification from the Bursar’s Office regarding the pending school tuition and activity fees for your child, [Student Name] (Grade: [Grade], Admission No: [Admission No]).

Fee Breakdown Summary:
• Outstanding Tuition Fee: $[Amount Due]
• Late Assessment Grace Period Ends: [Due Date]
• Reference / Invoice ID: [Invoice Number]

To avoid late processing surcharges or disruption in online learning portal access, kindly settle the balance on or before [Due Date].

Payment Options:
1. Online Payment: Click below to access the GIS Parent Secure Payment Gateway.
2. Direct Wire Transfer: GGPS Educational Trust (HDFC Bank, Acct: 4402-9912-001, Ref: [Admission No]).

If payment has already been remitted in the last 24 hours, please disregard this notice.

Sincerely,
Office of Finance & Bursar
GGPS School`,
  },
  {
    id: 'admission_letter',
    name: 'Admission Acceptance Letter',
    category: 'admission_letter',
    badge: 'Admissions',
    subject: 'Official Letter of Admission: Welcome to GGPS School - [Student Name]',
    defaultBody: `Dear [Parent Name],

On behalf of the Governing Board and Academic Faculty of GGPS School, it gives us immense pleasure to offer [Student Name] formal admission to Grade [Grade] for the Academic Session [Academic Year].

Admission Particulars:
• Student Name: [Student Name]
• Assigned Grade: [Grade]
• Student ID / Roll: [Admission No]
• Orientation & Reporting Date: [Reporting Date]
• Assigned House: Phoenix Blue

Next Steps for Enrollment Confirmation:
1. Complete registration verification via the GIS Student ERP Portal.
2. Submit original medical clearance and immunization records by [Due Date].
3. Orientation uniform fitting sessions begin next Monday from 9:00 AM to 3:00 PM.

We warmly welcome your family into our vibrant scholastic community!

Warm regards,
Dr. Marcus Vance, Ph.D.
Principal & Head of School
GGPS School`,
  },
  {
    id: 'report_card',
    name: 'Report Card & Performance Dispatch',
    category: 'report_card',
    badge: 'Academics',
    subject: 'Official Term Examination Report Card Released: [Student Name] (Grade [Grade])',
    defaultBody: `Dear Parent / Guardian,

The Academic Examination Board of GGPS School has published the official Semester Assessment Results and Progress Portfolio for [Student Name] (Grade [Grade]).

Performance Snapshot:
• Semester Grade Average (GPA): [GPA / Marks %]
• Term Attendance Record: [Attendance %]
• Conduct & Extracurricular Rating: Exemplary

Detailed Subject Performance & Teacher Notes:
The comprehensive report card containing subject-wise percentiles, faculty observations, and developmental milestones is now available for download in the GIS Parent Portal.

Parent-Teacher Consultation (PTC) Notice:
Parent-Teacher conferences will take place on [PTA Meeting Date]. Please reserve your 15-minute slot with the class homeroom advisor via the portal.

Congratulations to [Student Name] on their hard work this semester!

Cordially,
Academic Examination Board
GGPS School`,
  },
  {
    id: 'disciplinary_memo',
    name: 'Behavioral & Disciplinary Memo',
    category: 'disciplinary_memo',
    badge: 'Disciplinary',
    subject: 'CONFIDENTIAL: Student Conduct & Disciplinary Memo regarding [Student Name]',
    defaultBody: `Dear [Parent Name],

This communication is from the Office of Student Welfare and Disciplinary Committee regarding an incident involving [Student Name] (Grade [Grade]) on [Incident Date].

Summary of Observation:
[Incident Summary]

School Code of Conduct Policy:
GGPS School strictly enforces principles of mutual respect, safety, and academic integrity as outlined in Section 4.2 of the Student Handbook.

Required Action:
In accordance with school policy, a mandatory in-person conference has been scheduled with the Dean of Students on [Mandatory Parent Conference Date] at 09:30 AM in Office 204.

Please confirm receipt of this memo and your availability for the scheduled meeting.

Respectfully,
Dean of Student Affairs
GGPS School`,
  },
  {
    id: 'general_notice',
    name: 'General Institutional Circular',
    category: 'general_notice',
    badge: 'Circular',
    subject: 'General School Circular: Campus Updates and Upcoming Events',
    defaultBody: `Dear GIS Community,

Please take note of the upcoming schedule and administrative updates for the upcoming academic cycle.

Key Announcements:
1. Mid-Term Recess dates and campus facility maintenance hours.
2. Annual Science & Technology Exhibition submission deadline: [Due Date].
3. Campus facility and schedule updates for North Campus.

Thank you for your continuous partnership in fostering excellence.

Best regards,
Administration Directorate
GGPS School`,
  },
];

// @desc    Get All Emails (Inbox, Sent, Drafts, Starred, Trash)
// @route   GET /api/email
export const getEmails = async (req: Request, res: Response): Promise<void> => {
  try {
    const folder = (req.query.folder as string) || 'all';
    
    // Attempt database query only if connected
    let emails: any[] = [];
    if (mongoose.connection.readyState === 1) {
      try {
        let filter: any = {};
        if (folder === 'starred') {
          filter.starred = true;
        } else if (folder !== 'all') {
          filter.folder = folder;
        }
        emails = await Email.find(filter).sort({ createdAt: -1 });
      } catch (dbErr) {
        emails = inMemoryEmails;
      }
    } else {
      emails = inMemoryEmails;
    }

    if (!emails || emails.length === 0) {
      emails = inMemoryEmails;
    }

    // Apply folder filtering if pulled from fallback
    if (folder === 'starred') {
      emails = emails.filter((e) => e.starred);
    } else if (folder !== 'all') {
      emails = emails.filter((e) => e.folder === folder);
    }

    res.json({
      success: true,
      count: emails.length,
      emails,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch emails' });
  }
};

// @desc    Get Email Templates
// @route   GET /api/email/templates
export const getTemplates = async (req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    templates: EMAIL_TEMPLATES,
  });
};

// @desc    Get Autocomplete Recipients (Users + Parents + Dynamic Groups)
// @route   GET /api/email/recipients
export const getRecipients = async (req: Request, res: Response): Promise<void> => {
  try {
    let usersList: any[] = [];
    let parentsList: any[] = [];

    if (mongoose.connection.readyState === 1) {
      try {
        usersList = await User.find({ isActive: { $ne: false } }).select('firstName lastName email role designation');
        parentsList = await Parent.find().select('fatherName motherName primaryEmail');
      } catch (e) {
        // Fallback
      }
    }

    // Fallback users if DB returned nothing
    if (!usersList || usersList.length === 0) {
      usersList = [
        { _id: 'u1', firstName: 'Marcus', lastName: 'Vance', email: 'principal@globalinternationalschool.edu', designation: 'Principal' },
        { _id: 'u2', firstName: 'Sarah', lastName: 'Jenkins', email: 's.jenkins@globalinternationalschool.edu', designation: 'Head of Mathematics' },
        { _id: 'u3', firstName: 'David', lastName: 'Chen', email: 'd.chen@globalinternationalschool.edu', designation: 'Pre-KG Phonics Lead Teacher' },
        { _id: 'u4', firstName: 'Robert', lastName: 'Taylor', email: 'bursar@globalinternationalschool.edu', designation: 'Chief Finance Officer' },
        { _id: 'u5', firstName: 'Elena', lastName: 'Rostova', email: 'e.rostova@globalinternationalschool.edu', designation: 'Dean of Students' },
      ];
    }

    // Fallback parents if DB returned nothing
    if (!parentsList || parentsList.length === 0) {
      parentsList = [
        { _id: 'p1', fatherName: 'Arthur', motherName: 'Eleanor Harrison', primaryEmail: 'e.harrison@gmail.com' },
        { _id: 'p2', fatherName: 'Jonathan', motherName: 'Claire Miller', primaryEmail: 'parent@school.com' },
        { _id: 'p3', fatherName: 'Vikram', motherName: 'Priya Sharma', primaryEmail: 'v.sharma@outlook.com' },
        { _id: 'p4', fatherName: 'Carlos', motherName: 'Maria Rodriguez', primaryEmail: 'carlos.rodriguez@gmail.com' },
        { _id: 'p5', fatherName: 'Michael', motherName: 'Rachel Green', primaryEmail: 'rachel.green@gmail.com' },
      ];
    }

    const formattedRecipients = [
      ...usersList.map((u) => ({
        id: String(u._id),
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        type: 'Staff',
        title: u.designation || 'Faculty Member',
        badge: 'Staff',
      })),
      ...parentsList.map((p) => ({
        id: String(p._id),
        name: p.fatherName && p.motherName ? `${p.fatherName} & ${p.motherName}` : p.motherName || p.fatherName || 'Parent',
        email: p.primaryEmail,
        type: 'Parent',
        title: 'Parent / Guardian',
        badge: 'Parent',
      })),
    ];

    res.json({
      success: true,
      groups: RECIPIENT_GROUPS,
      recipients: formattedRecipients,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Dispatch / Send Email
// @route   POST /api/email/send
export const sendEmailMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipients, recipientGroups, subject, body, category = 'general_notice', priority = 'normal' } = req.body;

    if (!recipients || (!Array.isArray(recipients) && typeof recipients !== 'string')) {
      res.status(400).json({ success: false, message: 'Please specify recipient(s).' });
      return;
    }

    const recipientArray = Array.isArray(recipients) ? recipients : [recipients];
    if (recipientArray.length === 0 && (!recipientGroups || recipientGroups.length === 0)) {
      res.status(400).json({ success: false, message: 'Recipient list cannot be empty.' });
      return;
    }

    if (!subject || !body) {
      res.status(400).json({ success: false, message: 'Subject and body are required.' });
      return;
    }

    // Convert plain text body to structured HTML with official GIS letterhead
    const formattedHtmlBody = body
      .split('\n\n')
      .map((para: string) => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('');

    const htmlContent = wrapSchoolBrandedHtml(subject, category, formattedHtmlBody);

    // Call Nodemailer service
    const dispatchResult = await emailService.sendEmail({
      to: recipientArray.length > 0 ? recipientArray : ['all-recipients@globalinternationalschool.edu'],
      subject,
      text: body,
      html: htmlContent,
    });

    const newEmailData: any = {
      sender: 'Super Admin',
      senderEmail: process.env.SMTP_USER || 'superadmin@globalinternationalschool.edu',
      recipients: recipientArray,
      recipientGroups: recipientGroups || [],
      subject,
      preview: body.substring(0, 140) + '...',
      body,
      html: htmlContent,
      category: category as any,
      folder: 'sent' as const,
      priority: priority as any,
      status: dispatchResult.mode === 'smtp' ? ('delivered' as const) : ('simulated' as const),
      messageId: dispatchResult.messageId,
      starred: false,
      read: true,
      createdAt: new Date(),
    };

    let savedEmail = null;
    if (mongoose.connection.readyState === 1) {
      try {
        savedEmail = await Email.create(newEmailData);
      } catch (dbErr) {
        savedEmail = { ...newEmailData, _id: `mem_mail_${Date.now()}` };
        inMemoryEmails.unshift(savedEmail);
      }
    } else {
      savedEmail = { ...newEmailData, _id: `mem_mail_${Date.now()}` };
      inMemoryEmails.unshift(savedEmail);
    }

    res.status(201).json({
      success: true,
      message: dispatchResult.mode === 'smtp' ? 'Email successfully dispatched via SMTP.' : 'Email logged and sent in Simulated Sandbox mode.',
      mode: dispatchResult.mode,
      messageId: dispatchResult.messageId,
      email: savedEmail,
    });
  } catch (error: any) {
    console.error('❌ [sendEmailMessage Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to dispatch email' });
  }
};

// @desc    Toggle Star on an Email
// @route   PATCH /api/email/:id/star
export const toggleStar = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    let email = null;
    try {
      email = await Email.findById(id);
      if (email) {
        email.starred = !email.starred;
        await email.save();
        res.json({ success: true, email });
        return;
      }
    } catch (e) {}

    // In-memory fallback
    const memMail = inMemoryEmails.find((m) => m._id === id || m.messageId === id);
    if (memMail) {
      memMail.starred = !memMail.starred;
      res.json({ success: true, email: memMail });
      return;
    }

    res.status(404).json({ success: false, message: 'Email not found' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Email
// @route   DELETE /api/email/:id
export const deleteEmail = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    try {
      await Email.findByIdAndDelete(id);
    } catch (e) {}

    inMemoryEmails = inMemoryEmails.filter((m) => m._id !== id && m.messageId !== id);
    res.json({ success: true, message: 'Email deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
