import express from 'express';
import {
  getFees,
  createFee,
  updateFee,
  getExpenses,
  createExpense,
  payFee,
  createPaymentOrder,
  recordManualPayment,
  handlePaymentWebhook,
  downloadFeeInvoicePDF,
  downloadPaymentReceiptPDF,
  exportFinanceData,
} from '../controllers/financeController';
import { protect, authorize } from '../middleware/auth';

import { validate } from '../middleware/validate';
import { createFeeSchema, createExpenseSchema } from '../validators/financeValidator';

const router = express.Router();

// Webhook endpoint: Cryptographically verified server-side (no JWT auth needed)
router.post('/webhook', handlePaymentWebhook);

// Admins & Accountants can manage finance, Parents can view their fees and pay invoices
const adminAuth = [protect, authorize('Admin', 'SuperAdmin', 'Accountant')];
const feeViewAuth = [protect, authorize('Admin', 'SuperAdmin', 'Accountant', 'Parent')];

// Export route
router.get('/export', adminAuth, exportFinanceData);

// PDF Downloads
router.get('/fees/:id/pdf', feeViewAuth, downloadFeeInvoicePDF);
router.get('/receipts/:receiptNumber/pdf', feeViewAuth, downloadPaymentReceiptPDF);

router.get('/fees', feeViewAuth, getFees);
router.post('/fees', adminAuth, validate(createFeeSchema), createFee);
router.put('/fees/:id', adminAuth, updateFee);
router.post('/fees/:id/create-payment-order', feeViewAuth, createPaymentOrder);
router.post('/fees/:id/pay', feeViewAuth, payFee);
router.post('/fees/:id/record-manual-payment', adminAuth, recordManualPayment);

router.get('/expenses', adminAuth, getExpenses);
router.post('/expenses', adminAuth, validate(createExpenseSchema), createExpense);

export default router;
