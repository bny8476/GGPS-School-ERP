import { describe, it, expect } from '@jest/globals';
import {
  generateNextStudentID,
  generateNextAdmissionNumber,
  generateNextEmployeeID,
  generateNextReceiptNumber,
} from '../services/sequenceService';

describe('ERP Sequence ID Generation Engine', () => {
  it('should generate academic-year and class-aware student ID', async () => {
    const studentId = await generateNextStudentID('LKG');
    expect(studentId).toMatch(/^GGPS\d{4}LKG\d{3}$/);

    const prekgId = await generateNextStudentID('PreKG');
    expect(prekgId).toMatch(/^GGPS\d{4}PREKG\d{3}$/);

    const ukgId = await generateNextStudentID('UKG');
    expect(ukgId).toMatch(/^GGPS\d{4}UKG\d{3}$/);
  });

  it('should generate valid admission number', async () => {
    const admissionNo = await generateNextAdmissionNumber();
    expect(admissionNo).toMatch(/^GGPS\d{4}Admin\d{3}$/);
  });

  it('should generate valid employee ID with role prefix', async () => {
    const teacherId = await generateNextEmployeeID('Teacher');
    expect(teacherId).toMatch(/^GGPS-\d{4}-Teacher-\d{3}$/);

    const accountantId = await generateNextEmployeeID('Accountant');
    expect(accountantId).toMatch(/^GGPS-\d{4}-Accountant-\d{3}$/);
  });

  it('should generate unique receipt numbers for financial audit', async () => {
    const receipt1 = await generateNextReceiptNumber();
    const receipt2 = await generateNextReceiptNumber();
    expect(receipt1).toMatch(/^REC-\d{4}-\d{5}$/);
    expect(receipt2).toMatch(/^REC-\d{4}-\d{5}$/);
    expect(receipt1).not.toBe(receipt2);
  });
});
