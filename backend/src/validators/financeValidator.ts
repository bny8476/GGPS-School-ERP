import { z } from 'zod';
import {
  positiveNumberValidator,
  percentageValidator,
  objectIdValidator,
  createNameValidator,
} from './commonValidators';

export const createFeeSchema = z.object({
  body: z.object({
    studentId: objectIdValidator('Student ID'),
    title: z.string().trim().min(2, 'Fee title must be at least 2 characters').max(100),
    amount: positiveNumberValidator('Fee amount'),
    dueDate: z.string().or(z.date()),
    category: z.string().trim().optional(),
  }),
});

export const recordPaymentSchema = z.object({
  body: z.object({
    amount: positiveNumberValidator('Payment amount'),
    paymentMethod: z.string().trim().min(1, 'Payment method is required'),
    transactionId: z.string().trim().optional(),
    note: z.string().trim().max(300).optional(),
    gatewayOrderId: z.string().trim().optional(),
    gatewayPaymentId: z.string().trim().optional(),
    gatewaySignature: z.string().trim().optional(),
    signature: z.string().trim().optional(),
  }),
});

export const createExpenseSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2, 'Expense title must be at least 2 characters').max(100),
    category: z.string().trim().min(1, 'Category is required'),
    amount: positiveNumberValidator('Expense amount'),
    date: z.string().or(z.date()).optional(),
    description: z.string().trim().max(400).optional(),
  }),
});

export const createScholarshipSchema = z.object({
  body: z.object({
    studentName: createNameValidator('Student name', 2, 80),
    admissionNo: z.string().trim().optional(),
    grade: z.string().trim().min(1, 'Grade is required'),
    category: z.string().trim().min(1, 'Category is required'),
    discountPercentage: percentageValidator,
  }),
});
