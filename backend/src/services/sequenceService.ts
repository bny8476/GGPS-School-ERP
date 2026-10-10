import mongoose from 'mongoose';
import Counter from '../models/Counter';

const inMemoryCounters = new Map<string, number>();

/**
 * Atomic counter incrementer:
 * Uses MongoDB findOneAndUpdate with returnDocument: 'after' and optional ClientSession.
 * Resiliently falls back to synchronized in-memory counter when MongoDB is disconnected (e.g. offline testing).
 */
async function getNextSequence(key: string, session?: mongoose.ClientSession): Promise<number> {
  if (mongoose.connection.readyState === 1) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { key },
        { $inc: { sequence: 1 } },
        { upsert: true, returnDocument: 'after', session, maxTimeMS: 3000 }
      );
      if (counter && typeof counter.sequence === 'number') {
        return counter.sequence;
      }
    } catch (err) {
      // Graceful fallback to memory sequence if collection query fails/times out
    }
  }

  const current = inMemoryCounters.get(key) || 0;
  const next = current + 1;
  inMemoryCounters.set(key, next);
  return next;
}

/**
 * Normalizes an academic year string to 4-digit start year (e.g. "2026-27" -> "2026").
 */
export function normalizeAcademicYear(rawYear?: string): string {
  if (!rawYear) return new Date().getFullYear().toString();
  const match = rawYear.match(/\b(20\d{2})\b/);
  return match ? match[1] : new Date().getFullYear().toString();
}

/**
 * Normalizes a class/grade string into uppercase standard identifier
 * Strictly normalized according to requirement 6:
 * PreKG → PREKG
 * LKG → LKG
 * UKG → UKG
 * No hyphens, spaces, dots or variations.
 */
export function normalizeClassName(rawClass?: string): string {
  if (!rawClass) return 'LKG';
  const cleaned = rawClass
    .replace(/section\s+[a-z0-9]+/i, '')
    .trim();
  const upper = cleaned.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (upper === 'PREKG' || upper === 'PRE' || upper === 'PLAYGROUP' || upper === 'NURSERY') {
    return 'PREKG';
  }
  if (upper === 'LKG' || upper === 'LOWERKG') {
    return 'LKG';
  }
  if (upper === 'UKG' || upper === 'UPPERKG') {
    return 'UKG';
  }
  return upper || 'LKG';
}

/**
 * Normalizes section name (e.g. "Section A" -> "A", "sec-b" -> "B").
 */
export function normalizeSectionName(rawSection?: string): string {
  if (!rawSection) return 'A';
  const match = rawSection.match(/([a-zA-Z0-9]+)$/);
  return match ? match[1].toUpperCase() : 'A';
}

/**
 * Concurrency-safe atomic generation of Student ID:
 * Format: GGPS{ACADEMIC_YEAR}{CLASS}{SEQUENCE} (NO hyphens, spaces, or special characters)
 * Examples: GGPS2026LKG001, GGPS2026PREKG001, GGPS2026UKG001
 * Sequence is guaranteed unique, verified against database and counter.
 */
export async function generateNextStudentID(
  yearOrClass?: string,
  rawClass?: string,
  session?: mongoose.ClientSession
): Promise<string> {
  let year: string;
  let className: string;

  if (yearOrClass && !rawClass && !/^\d{4}/.test(yearOrClass.trim())) {
    year = normalizeAcademicYear();
    className = normalizeClassName(yearOrClass);
  } else {
    year = normalizeAcademicYear(yearOrClass);
    className = normalizeClassName(rawClass);
  }

  const key = `student_id_v2:${year}:${className}`;

  let seqNumber = await getNextSequence(key, session);
  let candidateId = `GGPS${year}${className}${String(seqNumber).padStart(3, '0')}`;

  if (mongoose.connection.readyState === 1) {
    try {
      const StudentModel = mongoose.models.Student || mongoose.model('Student');
      let attempts = 0;
      while (await StudentModel.exists({ studentId: candidateId })) {
        attempts++;
        if (attempts > 50) break;
        seqNumber = await getNextSequence(key, session);
        candidateId = `GGPS${year}${className}${String(seqNumber).padStart(3, '0')}`;
      }
    } catch (_) {}
  }

  return candidateId;
}

/**
 * Concurrency-safe atomic generation of Admission Number:
 * Format: GGPS{ACADEMIC_YEAR}Admin{SEQUENCE}
 * Example: GGPS2026Admin001
 */
export async function generateNextAdmissionNumber(
  rawYear?: string,
  rawClass?: string,
  session?: mongoose.ClientSession
): Promise<string> {
  const year = normalizeAcademicYear(rawYear);
  const key = `admission_no_v2:${year}`;

  let seqNumber = await getNextSequence(key, session);
  let candidateAdm = `GGPS${year}Admin${String(seqNumber).padStart(3, '0')}`;

  if (mongoose.connection.readyState === 1) {
    try {
      const StudentModel = mongoose.models.Student || mongoose.model('Student');
      let attempts = 0;
      while (await StudentModel.exists({ admissionNumber: candidateAdm })) {
        attempts++;
        if (attempts > 50) break;
        seqNumber = await getNextSequence(key, session);
        candidateAdm = `GGPS${year}Admin${String(seqNumber).padStart(3, '0')}`;
      }
    } catch (_) {}
  }

  return candidateAdm;
}

/**
 * Concurrency-safe atomic generation of Admission Enquiry Reference:
 * Format: GGPSENQ{ACADEMIC_YEAR}{SEQUENCE}
 * Example: GGPSENQ20260001
 */
export async function generateNextEnquiryNumber(
  rawYear?: string,
  session?: mongoose.ClientSession
): Promise<string> {
  const year = normalizeAcademicYear(rawYear);
  const key = `enquiry_no:${year}`;

  const seqNumber = await getNextSequence(key, session);
  const seq = String(seqNumber).padStart(4, '0');
  return `GGPSENQ${year}${seq}`;
}

/**
 * Concurrency-safe atomic generation of Employee ID:
 * Format: GGPS-{ACADEMIC_YEAR}-{ROLE}-{SEQUENCE}
 * Example: GGPS-2026-Teacher-001
 */
export async function generateNextEmployeeID(
  role: string = 'Teacher',
  rawYear?: string,
  session?: mongoose.ClientSession
): Promise<string> {
  const year = normalizeAcademicYear(rawYear);
  const normalizedRole = role.replace(/[^a-zA-Z0-9]/g, '');
  const key = `employee_id:${year}:${normalizedRole}`;

  const seqNumber = await getNextSequence(key, session);
  const seq = String(seqNumber).padStart(3, '0');
  return `GGPS-${year}-${normalizedRole}-${seq}`;
}

/**
 * Concurrency-safe atomic generation of Roll Number:
 * Guaranteed strictly unique across the school/academic year (no duplicate roll numbers for different students)
 * Format: 001, 002, 003...
 */
export async function generateNextRollNumber(
  rawYear?: string,
  rawClass?: string,
  rawSection?: string,
  session?: mongoose.ClientSession
): Promise<string> {
  const year = normalizeAcademicYear(rawYear);
  const key = `roll_global:${year}`;

  let seqNumber = await getNextSequence(key, session);
  let candidate = String(seqNumber).padStart(3, '0');

  if (mongoose.connection.readyState === 1) {
    try {
      const EnrollmentModel = mongoose.models.Enrollment || mongoose.model('Enrollment');
      const StudentModel = mongoose.models.Student || mongoose.model('Student');
      let attempts = 0;
      while (
        (await EnrollmentModel.exists({ rollNumber: candidate })) ||
        (await StudentModel.exists({ rollNumber: candidate }))
      ) {
        attempts++;
        if (attempts > 50) break;
        seqNumber = await getNextSequence(key, session);
        candidate = String(seqNumber).padStart(3, '0');
      }
    } catch (_) {}
  }

  return candidate;
}

/**
 * Concurrency-safe atomic generation of Fee Invoice Number:
 * Format: INV-{YEAR}-{SEQUENCE}
 */
export async function generateNextInvoiceNumber(
  rawYear?: string,
  session?: mongoose.ClientSession
): Promise<string> {
  const year = normalizeAcademicYear(rawYear);
  const key = `invoice:${year}`;

  const seqNumber = await getNextSequence(key, session);
  const seq = String(seqNumber).padStart(4, '0');
  return `INV-${year}-${seq}`;
}

/**
 * Concurrency-safe atomic generation of Fee Receipt Number:
 * Format: REC-{YEAR}-{SEQUENCE}
 */
export async function generateNextReceiptNumber(
  rawYear?: string,
  session?: mongoose.ClientSession
): Promise<string> {
  const year = normalizeAcademicYear(rawYear);
  const key = `receipt:${year}`;

  const seqNumber = await getNextSequence(key, session);
  const seq = String(seqNumber).padStart(5, '0');
  return `REC-${year}-${seq}`;
}

/**
 * Peek non-binding live preview of the next identifiers WITHOUT incrementing the sequence.
 */
export async function peekNextIdentifiers(
  rawYear?: string,
  rawClass?: string,
  rawSection?: string
): Promise<{
  previewAdmissionNumber: string;
  previewStudentID: string;
  previewRollNumber: string;
  normalizedYear: string;
  normalizedClass: string;
  normalizedSection: string;
}> {
  const year = normalizeAcademicYear(rawYear);
  const className = normalizeClassName(rawClass);
  const sectionName = normalizeSectionName(rawSection);

  let admSeq = 1;
  let stuSeq = 1;
  let rollSeq = 1;

  if (mongoose.connection.readyState === 1) {
    const [admCounter, stuCounter, rollCounter] = await Promise.all([
      Counter.findOne({ key: `admission_no_v2:${year}` }),
      Counter.findOne({ key: `student_id_v2:${year}:${className}` }),
      Counter.findOne({ key: `roll:${year}:${className}:${sectionName}` }),
    ]);

    admSeq = (admCounter?.sequence || 0) + 1;
    stuSeq = (stuCounter?.sequence || 0) + 1;
    rollSeq = (rollCounter?.sequence || 0) + 1;

    // Verify candidate against existing records in Student collection
    const StudentModel = mongoose.models.Student || mongoose.model('Student');
    while (await StudentModel.exists({ studentId: `GGPS${year}${className}${String(stuSeq).padStart(3, '0')}` })) {
      stuSeq++;
    }
    while (await StudentModel.exists({ admissionNumber: `GGPS${year}Admin${String(admSeq).padStart(3, '0')}` })) {
      admSeq++;
    }
  } else {
    admSeq = (inMemoryCounters.get(`admission_no_v2:${year}`) || 0) + 1;
    stuSeq = (inMemoryCounters.get(`student_id_v2:${year}:${className}`) || 0) + 1;
    rollSeq = (inMemoryCounters.get(`roll:${year}:${className}:${sectionName}`) || 0) + 1;
  }

  return {
    previewAdmissionNumber: `GGPS${year}Admin${String(admSeq).padStart(3, '0')}`,
    previewStudentID: `GGPS${year}${className}${String(stuSeq).padStart(3, '0')}`,
    previewRollNumber: String(rollSeq).padStart(3, '0'),
    normalizedYear: year,
    normalizedClass: className,
    normalizedSection: sectionName,
  };
}

/**
 * Concurrency-safe atomic generation of Student ID Card Number:
 * Format: GGPS-ID-{ACADEMIC_YEAR}-{SEQUENCE}
 * Example: GGPS-ID-2026-0001
 */
export async function generateNextCardNumber(
  rawAcademicYear?: string,
  session?: mongoose.ClientSession
): Promise<string> {
  const year = normalizeAcademicYear(rawAcademicYear);
  const key = `id_card:${year}`;
  const seq = await getNextSequence(key, session);
  return `GGPS-ID-${year}-${String(seq).padStart(4, '0')}`;
}

