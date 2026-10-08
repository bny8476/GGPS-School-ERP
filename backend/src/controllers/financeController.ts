import { Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import Fee from '../models/Fee';
import Expense from '../models/Expense';
import Parent from '../models/Parent';
import StudentParent from '../models/StudentParent';
import Student from '../models/Student';
import Notification from '../models/Notification';
import PaymentTransaction from '../models/PaymentTransaction';
import env from '../config/env';
import paymentGatewayService from '../services/paymentGatewayService';
import {
  generateNextReceiptNumber,
  generateNextInvoiceNumber,
} from '../services/sequenceService';
import { emitToUser, emitToRole } from '../socket';
import { generateFeeInvoicePDF, generatePaymentReceiptPDF } from '../utils/pdfGenerator';
import * as XLSX from 'xlsx';
import AuditLog from '../models/AuditLog';
import { escapeRegex } from '../utils/sanitizers';

// @desc    Get all fees (with role isolation & search/filter/pagination)
// @route   GET /api/finance/fees
export const getFees = async (req: Request, res: Response) => {
  try {
    const { status, studentId, search, page, limit } = req.query;
    let query: Record<string, any> = {};

    // 1. Role-based privacy for Parents
    if (req.user?.role === 'Parent') {
      const parent = await Parent.findOne({ userId: req.user.id });
      if (!parent) {
        return res.status(200).json([]);
      }

      const linkedRecords = await StudentParent.find({ parentId: parent._id }).select('studentId');
      const linkedStudentIds = linkedRecords.map((r) => r.studentId);
      const directStudents = await Student.find({ parentId: parent._id }).select('_id');
      const allStudentIds = [...new Set([...linkedStudentIds.map(String), ...directStudents.map((s) => String(s._id))])];

      if (studentId && !allStudentIds.includes(String(studentId))) {
        return res.status(403).json({ success: false, message: 'Access denied: You cannot view fee records for this student' });
      }

      query.studentId = studentId
        ? new mongoose.Types.ObjectId(String(studentId))
        : { $in: allStudentIds.map((id) => new mongoose.Types.ObjectId(id)) };
    } else if (studentId && mongoose.Types.ObjectId.isValid(String(studentId))) {
      query.studentId = new mongoose.Types.ObjectId(String(studentId));
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(escapeRegex(String(search).trim()), 'i');
      query.$or = [
        { invoiceNumber: searchRegex },
        { title: searchRegex },
        { feeType: searchRegex },
      ];
    }

    if (page) {
      const pageNum = Math.max(1, Number(page));
      const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
      const skip = (pageNum - 1) * limitNum;

      const [fees, total] = await Promise.all([
        Fee.find(query)
          .sort({ dueDate: 1 })
          .skip(skip)
          .limit(limitNum)
          .populate('studentId', 'firstName lastName grade admissionNumber studentId'),
        Fee.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        data: fees,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    }

    const fees = await Fee.find(query)
      .sort({ dueDate: 1 })
      .populate('studentId', 'firstName lastName grade admissionNumber studentId');

    res.status(200).json(fees);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error fetching fees', error });
  }
};

// @desc    Create a fee invoice
// @route   POST /api/finance/fees
export const createFee = async (req: Request, res: Response) => {
  try {
    const yearStr = new Date().getFullYear().toString();
    const invoiceNumber = req.body.invoiceNumber || (await generateNextInvoiceNumber(yearStr));
    const totalAmount = req.body.totalAmount ?? req.body.amount ?? 0;
    const feeType = req.body.feeType || req.body.category || 'Tuition';
    const title = req.body.title || 'School Fee';

    let grade = req.body.grade;
    if (!grade && req.body.studentId && mongoose.isValidObjectId(req.body.studentId)) {
      const s = await Student.findById(req.body.studentId).select('grade');
      if (s) grade = s.grade;
    }

    const fee = await Fee.create({
      ...req.body,
      totalAmount,
      feeType,
      title,
      grade,
      invoiceNumber,
      amountPaid: req.body.amountPaid || 0,
      status: req.body.status || 'Pending',
      paymentHistory: [],
    });

    // Notify parent if student has a linked parent
    if (fee.studentId) {
      const student = await Student.findById(fee.studentId).select('parentId firstName lastName');
      if (student?.parentId) {
        const parent = await Parent.findById(student.parentId).select('userId');
        if (parent?.userId) {
          const formattedDue = new Date(fee.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
          const notif = await Notification.create({
            recipient: parent.userId,
            userId: parent.userId,
            studentId: student._id,
            targetRole: 'Parent',
            title: 'New Fee Invoice Generated',
            message: `Fee invoice ${invoiceNumber} of ₹${fee.totalAmount.toLocaleString('en-IN')} for ${student.firstName} is due by ${formattedDue}.`,
            type: 'fee',
            priority: 'normal',
            link: '/parent/fees',
            metadata: { feeId: fee._id, invoiceNumber, amount: fee.totalAmount, dueDate: fee.dueDate },
          });
          emitToUser(parent.userId.toString(), 'notification:new', notif);
        }
      }
    }

    res.status(201).json({ success: true, message: 'Fee invoice created successfully', fee });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid fee data', error });
  }
};

// @desc    Get all expenses
// @route   GET /api/finance/expenses
export const getExpenses = async (req: Request, res: Response) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error fetching expenses', error });
  }
};

// @desc    Record an expense
// @route   POST /api/finance/expenses
export const createExpense = async (req: Request, res: Response) => {
  try {
    const recordedBy = req.user?.id;
    if (!recordedBy) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const expense = await Expense.create({ ...req.body, recordedBy });
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid expense data', error });
  }
};

// @desc    Update a fee record (strict whitelist to prevent unauthorized mass-assignment)
// @route   PUT /api/finance/fees/:id
export const updateFee = async (req: Request, res: Response) => {
  try {
    const allowedFields = ['feeType', 'dueDate', 'discount', 'fine', 'remarks', 'academicYearId'];
    const sanitizedUpdates: Record<string, any> = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        sanitizedUpdates[key] = req.body[key];
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid updateable fee fields provided. (Allowed: ' + allowedFields.join(', ') + ')',
      });
    }

    const fee = await Fee.findByIdAndUpdate(req.params.id, sanitizedUpdates, { new: true, runValidators: true });
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });
    res.status(200).json(fee);
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating fee', error });
  }
};

// @desc    Initiate/create payment gateway order for parent fee payment
// @route   POST /api/finance/fees/:id/create-payment-order
export const createPaymentOrder = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const feeId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!feeId || !mongoose.Types.ObjectId.isValid(feeId)) {
      return res.status(400).json({ success: false, message: 'Invalid fee invoice ID format' });
    }

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee invoice not found' });
    }

    // Role-based child ownership verification for parent
    if (req.user?.role === 'Parent') {
      const parent = await Parent.findOne({ userId: req.user.id });
      if (!parent) {
        return res.status(403).json({ success: false, message: 'Access denied: Parent profile not found' });
      }
      const isDirectChild = await Student.findOne({ _id: fee.studentId, parentId: parent._id });
      const isJunctionChild = await StudentParent.findOne({ studentId: fee.studentId, parentId: parent._id, status: { $ne: 'inactive' } });
      if (!isDirectChild && !isJunctionChild) {
        return res.status(403).json({ success: false, message: 'Access denied: You cannot create orders for other students' });
      }
    }

    if (fee.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'This fee invoice has already been fully settled' });
    }

    const remainingBalance = Math.max(0, fee.totalAmount - (fee.amountPaid || 0));
    const orderAmount = req.body.amount ? Math.min(Number(req.body.amount), remainingBalance) : remainingBalance;

    const orderResult = await paymentGatewayService.createOrder({
      amount: orderAmount,
      currency: 'INR',
      receipt: `rcpt_${String(fee._id).slice(-8)}`,
      notes: { feeId: String(fee._id), studentId: String(fee.studentId) },
    });

    const gatewayOrderId = orderResult.orderId;
    const orderTimestamp = Date.now();
    const orderSignature = orderResult.signature;

    // Audit record in PaymentTransaction collection
    await PaymentTransaction.create({
      transactionId: gatewayOrderId,
      orderId: gatewayOrderId,
      feeId: fee._id,
      studentId: fee.studentId,
      payerId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      amount: orderAmount,
      currency: 'INR',
      status: 'Created',
    });

    return res.json({
      success: true,
      data: {
        feeId: fee._id,
        gatewayOrderId,
        amount: orderAmount,
        amountInPaise: Math.round(orderAmount * 100),
        currency: 'INR',
        keyId: paymentGatewayService.getKeyId(),
        orderTimestamp,
        orderSignature,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to create payment order', error: error.message });
  }
};

// @desc    Pay / settle fee invoice (Idempotent, strictly validates amounts, payment gateway verification, and authorization)
// @route   POST /api/finance/fees/:id/pay
export const payFee = async (req: Request, res: Response) => {
  try {
    const { amount, paymentMethod = 'Online / UPI', transactionId, gatewayOrderId, gatewaySignature, gatewayPaymentId } = req.body;

    const rawId = req.params.id;
    const feeId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!feeId || !mongoose.Types.ObjectId.isValid(feeId)) {
      return res.status(400).json({ success: false, message: 'Invalid fee invoice ID format' });
    }

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee invoice not found' });
    }

    // Role-based child ownership verification for parent
    if (req.user?.role === 'Parent') {
      const parent = await Parent.findOne({ userId: req.user.id });
      if (!parent) {
        return res.status(403).json({ success: false, message: 'Access denied: Parent profile not found' });
      }
      const isDirectChild = await Student.findOne({ _id: fee.studentId, parentId: parent._id });
      const isJunctionChild = await StudentParent.findOne({ studentId: fee.studentId, parentId: parent._id, status: { $ne: 'inactive' } });
      if (!isDirectChild && !isJunctionChild) {
        return res.status(403).json({ success: false, message: 'Access denied: You cannot pay fees for other students' });
      }
    }

    // Check if fee is already fully paid
    if (fee.status === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'This fee invoice has already been fully settled.',
      });
    }

    // SECURITY TRUST BOUNDARY: Check payment origin & enforce gateway verification
    const isStaff = ['Admin', 'SuperAdmin', 'Accountant'].includes(req.user?.role || '');
    const sig = req.body.signature || gatewaySignature;

    if (!isStaff) {
      // Parent online payments strictly require payment gateway verification
      if (!gatewayOrderId || !gatewayPaymentId || !sig) {
        await PaymentTransaction.create({
          transactionId: gatewayOrderId || `ATTEMPT_${Date.now()}`,
          orderId: gatewayOrderId || 'UNKNOWN',
          feeId: fee._id,
          studentId: fee.studentId,
          payerId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
          amount: Number(amount) || 0,
          currency: 'INR',
          status: 'Failed',
          failureReason: 'Missing required payment gateway verification parameters (gatewayOrderId, gatewayPaymentId, signature)',
          rawPayload: req.body,
        }).catch(() => null);

        return res.status(400).json({
          success: false,
          message:
            'Missing required payment gateway verification parameters (gatewayOrderId, gatewayPaymentId, signature).',
        });
      }

      let isGatewayVerified = await paymentGatewayService.verifyPayment(gatewayOrderId, gatewayPaymentId, sig);

      // Verify against authenticated order created via createPaymentOrder
      if (!isGatewayVerified && gatewayOrderId && sig) {
        const existingTx = await PaymentTransaction.findOne({ orderId: gatewayOrderId, feeId: fee._id, status: 'Created' });
        if (existingTx) {
          const expectedSig = crypto
            .createHmac('sha256', env.PAYMENT_GATEWAY_SECRET)
            .update(`${fee._id}:${gatewayOrderId}:${existingTx.amount}`)
            .digest('hex');
          if (sig === expectedSig) {
            isGatewayVerified = true;
          }
        }
      }
      if (!isGatewayVerified) {
        await PaymentTransaction.create({
          transactionId: gatewayOrderId || `ATTEMPT_${Date.now()}`,
          orderId: gatewayOrderId || 'UNKNOWN',
          paymentId: gatewayPaymentId,
          feeId: fee._id,
          studentId: fee.studentId,
          payerId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
          amount: Number(amount) || 0,
          currency: 'INR',
          status: 'Signature_Mismatch',
          failureReason: 'Invalid cryptographic payment signature from payment gateway',
          rawPayload: req.body,
        }).catch(() => null);

        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: Invalid cryptographic payment signature from payment gateway.',
        });
      }
    }

    // Apply amount-clamping/idempotency AFTER verification succeeds
    const remainingBalance = Math.max(0, fee.totalAmount - (fee.amountPaid || 0));
    const payAmount = Number(amount) > 0 ? Math.min(Number(amount), remainingBalance) : remainingBalance;

    if (payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero' });
    }

    // Concurrency-safe atomic generation of receipt number
    const yearStr = new Date().getFullYear().toString();
    const receiptNumber = await generateNextReceiptNumber(yearStr);
    const resolvedTxnId =
      transactionId ||
      gatewayPaymentId ||
      `TXN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const newAmountPaid = (fee.amountPaid || 0) + payAmount;
    fee.amountPaid = newAmountPaid;
    fee.status = newAmountPaid >= fee.totalAmount ? 'Paid' : 'Partial';
    fee.paidAt = new Date();
    fee.paymentMethod = paymentMethod;
    fee.transactionId = resolvedTxnId;
    fee.receiptNumber = receiptNumber;

    const paymentRecord = {
      receiptNumber,
      amount: payAmount,
      paymentMethod,
      transactionId: resolvedTxnId,
      paidAt: new Date(),
      paidBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
    };

    fee.paymentHistory.push(paymentRecord);
    await fee.save();

    // Record success in PaymentTransaction audit collection
    if (gatewayOrderId) {
      await PaymentTransaction.findOneAndUpdate(
        { orderId: gatewayOrderId },
        {
          $set: {
            transactionId: resolvedTxnId,
            paymentId: gatewayPaymentId || resolvedTxnId,
            feeId: fee._id,
            studentId: fee.studentId,
            payerId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
            amount: payAmount,
            currency: 'INR',
            status: 'Success',
            rawPayload: req.body,
          },
        },
        { upsert: true, new: true }
      ).catch(() => null);
    }

    // Send receipt notification to parent user
    if (req.user?.id) {
      const student = await Student.findById(fee.studentId).select('firstName lastName');
      const notif = await Notification.create({
        recipient: new mongoose.Types.ObjectId(req.user.id),
        userId: new mongoose.Types.ObjectId(req.user.id),
        studentId: fee.studentId,
        targetRole: 'Parent',
        title: 'Fee Payment Successful',
        message: `Payment of ₹${payAmount.toLocaleString('en-IN')} received for ${student?.firstName || 'Student'}. Receipt No: ${receiptNumber}.`,
        type: 'fee',
        priority: 'normal',
        link: '/parent/fees',
        metadata: { feeId: fee._id, receiptNumber, amount: payAmount, transactionId: resolvedTxnId },
      });
      emitToUser(req.user.id, 'notification:new', notif);
      emitToUser(req.user.id, 'payment:completed', { receiptNumber, amount: payAmount });
    }

    emitToRole('Accountant', 'fee:updated', { feeId: fee._id, receiptNumber, amount: payAmount });
    emitToRole('Admin', 'fee:updated', { feeId: fee._id, receiptNumber, amount: payAmount });

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      fee,
      receipt: {
        receiptNumber,
        paidAmount: payAmount,
        paymentMethod,
        transactionId: resolvedTxnId,
        date: new Date(),
        status: 'Completed',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process fee payment', error });
  }
};

// @desc    Handle payment gateway webhook (Cryptographic verification, idempotent fee settlement, and audit tracking)
// @route   POST /api/finance/webhook
export const handlePaymentWebhook = async (req: Request, res: Response) => {
  try {
    const signature =
      (req.headers['x-razorpay-signature'] as string) ||
      (req.headers['x-signature'] as string) ||
      req.body.signature;
    const rawPayload = req.body;

    if (!signature) {
      await PaymentTransaction.create({
        transactionId: `WEBHOOK_ERR_${Date.now()}`,
        orderId: rawPayload?.orderId || rawPayload?.payload?.payment?.entity?.order_id || 'UNKNOWN',
        feeId: new mongoose.Types.ObjectId(),
        amount: 0,
        status: 'Signature_Mismatch',
        failureReason: 'Missing webhook signature header',
        rawPayload,
      }).catch(() => null);
      return res.status(400).json({ success: false, message: 'Missing webhook signature' });
    }

    const isValidSignature = paymentGatewayService.verifyWebhookSignature(rawPayload, signature);
    if (!isValidSignature) {
      await PaymentTransaction.create({
        transactionId: `WEBHOOK_FAIL_${Date.now()}`,
        orderId: rawPayload?.orderId || rawPayload?.payload?.payment?.entity?.order_id || 'UNKNOWN',
        feeId: new mongoose.Types.ObjectId(),
        amount: 0,
        status: 'Signature_Mismatch',
        failureReason: 'Cryptographic signature mismatch on webhook payload',
        rawPayload,
      }).catch(() => null);
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    // Extract event details
    const paymentEntity = req.body.payload?.payment?.entity || req.body;
    const orderId = paymentEntity.order_id || req.body.orderId || req.body.gatewayOrderId;
    const paymentId = paymentEntity.id || req.body.paymentId || req.body.gatewayPaymentId;
    const rawAmount = paymentEntity.amount;
    const isPaise = Boolean(req.body.payload?.payment?.entity);
    const amount = isPaise && typeof rawAmount === 'number' ? rawAmount / 100 : Number(rawAmount) || 0;
    const feeId = paymentEntity.notes?.feeId || req.body.feeId;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Missing order ID in webhook payload' });
    }

    // Locate Fee by feeId or existing PaymentTransaction
    let targetFeeId = feeId;
    if (!targetFeeId) {
      const existingTxn = await PaymentTransaction.findOne({ orderId });
      if (existingTxn) {
        targetFeeId = existingTxn.feeId;
      }
    }

    if (!targetFeeId || !mongoose.Types.ObjectId.isValid(targetFeeId)) {
      await PaymentTransaction.create({
        transactionId: paymentId || orderId,
        orderId,
        paymentId,
        feeId: new mongoose.Types.ObjectId(),
        amount,
        status: 'Failed',
        failureReason: 'Unable to resolve corresponding Fee document from webhook',
        rawPayload,
      }).catch(() => null);
      return res.status(404).json({ success: false, message: 'Fee invoice reference not found' });
    }

    const fee = await Fee.findById(targetFeeId);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee document not found' });
    }

    // Idempotency: Check if this payment or order was already settled
    const alreadyProcessed = fee.paymentHistory?.some(
      (p: any) => p.transactionId === paymentId || p.transactionId === orderId
    );

    if (alreadyProcessed || fee.status === 'Paid') {
      await PaymentTransaction.findOneAndUpdate(
        { orderId },
        { $set: { status: 'Success', paymentId, amount, rawPayload } },
        { upsert: true }
      ).catch(() => null);
      return res.status(200).json({ success: true, message: 'Webhook already processed (idempotent)' });
    }

    // Settle fee
    const remainingBalance = Math.max(0, fee.totalAmount - (fee.amountPaid || 0));
    const payAmount = amount > 0 ? Math.min(amount, remainingBalance) : remainingBalance;
    const yearStr = new Date().getFullYear().toString();
    const receiptNumber = await generateNextReceiptNumber(yearStr);

    const newAmountPaid = (fee.amountPaid || 0) + payAmount;
    fee.amountPaid = newAmountPaid;
    fee.status = newAmountPaid >= fee.totalAmount ? 'Paid' : 'Partial';
    fee.paidAt = new Date();
    fee.paymentMethod = 'Online / Gateway Webhook';
    fee.transactionId = paymentId || orderId;
    fee.receiptNumber = receiptNumber;

    fee.paymentHistory.push({
      receiptNumber,
      amount: payAmount,
      paymentMethod: 'Online / Gateway Webhook',
      transactionId: paymentId || orderId,
      paidAt: new Date(),
    });
    await fee.save();

    // Update PaymentTransaction to Success
    await PaymentTransaction.findOneAndUpdate(
      { orderId },
      {
        $set: {
          transactionId: paymentId || orderId,
          orderId,
          paymentId,
          feeId: fee._id,
          studentId: fee.studentId,
          amount: payAmount,
          currency: 'INR',
          status: 'Success',
          rawPayload,
        },
      },
      { upsert: true }
    );

    emitToRole('Accountant', 'fee:updated', { feeId: fee._id, receiptNumber, amount: payAmount });
    emitToRole('Admin', 'fee:updated', { feeId: fee._id, receiptNumber, amount: payAmount });

    return res.status(200).json({ success: true, message: 'Payment webhook processed successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Webhook processing failed', error: error.message });
  }
};

// @desc    Record manual payment (Admin / Accountant only, for Cash / Cheque / Bank Transfer)
// @route   POST /api/finance/fees/:id/record-manual-payment
export const recordManualPayment = async (req: Request, res: Response) => {
  try {
    const { amount, paymentMethod = 'Cash', transactionId, note, reason } = req.body;
    const auditNote = note || reason;

    if (!auditNote || typeof auditNote !== 'string' || !auditNote.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A mandatory audit note/reason is required to record manual fee payments.',
      });
    }

    const rawId = req.params.id;
    const feeId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!feeId || !mongoose.Types.ObjectId.isValid(feeId)) {
      return res.status(400).json({ success: false, message: 'Invalid fee invoice ID format' });
    }

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee invoice not found' });
    }

    if (fee.status === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'This fee invoice has already been fully settled.',
      });
    }

    const remainingBalance = Math.max(0, fee.totalAmount - (fee.amountPaid || 0));
    const payAmount = Number(amount) > 0 ? Math.min(Number(amount), remainingBalance) : remainingBalance;

    if (payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero' });
    }

    const yearStr = new Date().getFullYear().toString();
    const receiptNumber = await generateNextReceiptNumber(yearStr);
    const resolvedTxnId =
      transactionId ||
      `MANUAL-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const newAmountPaid = (fee.amountPaid || 0) + payAmount;
    fee.amountPaid = newAmountPaid;
    fee.status = newAmountPaid >= fee.totalAmount ? 'Paid' : 'Partial';
    fee.paidAt = new Date();
    fee.paymentMethod = paymentMethod;
    fee.transactionId = resolvedTxnId;
    fee.receiptNumber = receiptNumber;

    const paymentRecord = {
      receiptNumber,
      amount: payAmount,
      paymentMethod,
      transactionId: resolvedTxnId,
      paidAt: new Date(),
      paidBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      note: auditNote.trim(),
    };

    fee.paymentHistory.push(paymentRecord);
    await fee.save();

    // Send receipt notification
    const student = await Student.findById(fee.studentId).select('firstName lastName parentId');
    if (student?.parentId) {
      const parentUser = await Parent.findById(student.parentId).select('userId');
      if (parentUser?.userId) {
        const notif = await Notification.create({
          recipient: parentUser.userId,
          userId: parentUser.userId,
          studentId: fee.studentId,
          targetRole: 'Parent',
          title: 'Manual Fee Payment Recorded',
          message: `Manual payment of ₹${payAmount.toLocaleString('en-IN')} recorded for ${student?.firstName || 'Student'}. Receipt No: ${receiptNumber}.`,
          type: 'fee',
          priority: 'normal',
          link: '/parent/fees',
          metadata: { feeId: fee._id, receiptNumber, amount: payAmount, transactionId: resolvedTxnId, note: auditNote.trim() },
        });
        emitToUser(parentUser.userId.toString(), 'notification:new', notif);
      }
    }

    emitToRole('Accountant', 'fee:updated', { feeId: fee._id, receiptNumber, amount: payAmount });
    emitToRole('Admin', 'fee:updated', { feeId: fee._id, receiptNumber, amount: payAmount });

    return res.status(200).json({
      success: true,
      message: 'Manual payment recorded successfully',
      fee,
      receipt: {
        receiptNumber,
        paidAmount: payAmount,
        paymentMethod,
        transactionId: resolvedTxnId,
        date: new Date(),
        status: 'Completed',
        note: auditNote.trim(),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to record manual fee payment', error });
  }
};

// @desc    Download Fee Invoice PDF
// @route   GET /api/finance/fees/:id/pdf
export const downloadFeeInvoicePDF = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid fee ID' });
    }

    const fee = await Fee.findById(id).populate('studentId', 'firstName lastName admissionNumber grade section rollNumber studentId');
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee invoice not found' });
    }

    // Role check for Parents
    if (req.user?.role === 'Parent') {
      const parent = await Parent.findOne({ userId: req.user.id });
      if (!parent) {
        return res.status(403).json({ success: false, message: 'Access denied: Parent profile not found' });
      }
      const isDirectChild = await Student.findOne({ _id: fee.studentId, parentId: parent._id });
      const isJunctionChild = await StudentParent.findOne({ studentId: fee.studentId, parentId: parent._id, status: { $ne: 'inactive' } });
      if (!isDirectChild && !isJunctionChild) {
        return res.status(403).json({ success: false, message: 'Access denied: Invoice does not belong to your ward' });
      }
    }

    // Audit Log
    AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      userName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
      userRole: req.user?.role,
      action: 'FILE_DOWNLOADED',
      module: 'Finance',
      targetId: String(fee._id),
      ipAddress: req.ip,
      details: `Downloaded Fee Invoice PDF for Invoice No: ${fee.invoiceNumber || fee._id}.`,
    }).catch(() => null);

    generateFeeInvoicePDF(res, fee);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to generate Fee Invoice PDF', error: error.message });
  }
};

// @desc    Download Fee Payment Receipt PDF
// @route   GET /api/finance/receipts/:receiptNumber/pdf
export const downloadPaymentReceiptPDF = async (req: Request, res: Response) => {
  try {
    const receiptNumber = String(req.params.receiptNumber || '');

    // Search by receiptNumber or by fee _id
    let fee = await Fee.findOne({
      $or: [
        { receiptNumber },
        { 'paymentHistory.receiptNumber': receiptNumber },
        ...(mongoose.isValidObjectId(receiptNumber) ? [{ _id: new mongoose.Types.ObjectId(receiptNumber) }] : []),
      ],
    }).populate('studentId', 'firstName lastName admissionNumber grade section rollNumber studentId');

    if (!fee) {
      return res.status(404).json({ success: false, message: 'Payment receipt record not found' });
    }

    // Role check for Parents
    if (req.user?.role === 'Parent') {
      const parent = await Parent.findOne({ userId: req.user.id });
      if (!parent) {
        return res.status(403).json({ success: false, message: 'Access denied: Parent profile not found' });
      }
      const isDirectChild = await Student.findOne({ _id: fee.studentId, parentId: parent._id });
      const isJunctionChild = await StudentParent.findOne({ studentId: fee.studentId, parentId: parent._id, status: { $ne: 'inactive' } });
      if (!isDirectChild && !isJunctionChild) {
        return res.status(403).json({ success: false, message: 'Access denied: Receipt does not belong to your ward' });
      }
    }

    // Locate exact payment entry if multiple
    let specificPayment = fee.paymentHistory?.find((p: any) => p.receiptNumber === receiptNumber);
    const receiptData = {
      receiptNumber: specificPayment?.receiptNumber || fee.receiptNumber || receiptNumber,
      amount: specificPayment?.amount || fee.amountPaid,
      paymentMethod: specificPayment?.paymentMethod || fee.paymentMethod,
      transactionId: specificPayment?.transactionId || fee.transactionId,
      paidAt: specificPayment?.paidAt || fee.paidAt || fee.updatedAt,
      studentId: fee.studentId,
      feeType: fee.feeType || fee.title,
      grade: fee.grade,
    };

    // Audit Log
    AuditLog.create({
      userId: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
      userName: `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email,
      userRole: req.user?.role,
      action: 'FILE_DOWNLOADED',
      module: 'Finance',
      targetId: String(fee._id),
      ipAddress: req.ip,
      details: `Downloaded Payment Receipt PDF No: ${receiptData.receiptNumber}.`,
    }).catch(() => null);

    generatePaymentReceiptPDF(res, receiptData);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to generate Payment Receipt PDF', error: error.message });
  }
};

// @desc    Export Finance Invoices/Receipts to CSV or XLSX
// @route   GET /api/finance/export
export const exportFinanceData = async (req: Request, res: Response) => {
  try {
    const { status, grade, format = 'csv', type = 'invoices' } = req.query;

    const query: Record<string, any> = {};
    if (status && status !== 'all') query.status = status;
    if (grade && grade !== 'all') query.grade = grade;

    const fees = await Fee.find(query)
      .populate('studentId', 'firstName lastName admissionNumber grade')
      .sort({ createdAt: -1 });

    const rows = fees.map((f: any) => {
      const student = f.studentId || {};
      const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';
      return {
        'Invoice Number': f.invoiceNumber || String(f._id),
        'Student Name': studentName,
        'Admission Number': student.admissionNumber || '-',
        'Grade / Class': f.grade || student.grade || '-',
        'Fee Category': f.feeType || 'Tuition',
        'Total Amount (INR)': f.totalAmount,
        'Amount Paid (INR)': f.amountPaid,
        'Balance Due (INR)': Math.max(0, (f.totalAmount || 0) - (f.amountPaid || 0)),
        'Payment Status': f.status,
        'Receipt Number': f.receiptNumber || '-',
        'Due Date': f.dueDate ? new Date(f.dueDate).toLocaleDateString('en-GB') : '-',
        'Last Paid At': f.paidAt ? new Date(f.paidAt).toLocaleDateString('en-GB') : '-',
      };
    });

    const filename = `GGPS-Finance-Ledger-${new Date().toISOString().split('T')[0]}`;

    if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Finance Ledger');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      return res.send(buffer);
    } else {
      // CSV Export
      const headers = [
        'Invoice Number', 'Student Name', 'Admission Number', 'Grade / Class',
        'Fee Category', 'Total Amount (INR)', 'Amount Paid (INR)', 'Balance Due (INR)',
        'Payment Status', 'Receipt Number', 'Due Date', 'Last Paid At',
      ];
      const csvLines = [headers.join(',')];

      rows.forEach((r) => {
        const line = headers
          .map((h) => {
            const val = String((r as any)[h] || '').replace(/"/g, '""');
            return `"${val}"`;
          })
          .join(',');
        csvLines.push(line);
      });

      const csvData = csvLines.join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csvData);
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Export failed', error: error.message });
  }
};


