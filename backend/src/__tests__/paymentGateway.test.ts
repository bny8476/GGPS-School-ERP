import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import financeRoutes from '../routes/financeRoutes';
import User from '../models/User';
import Fee from '../models/Fee';
import Parent from '../models/Parent';
import Student from '../models/Student';
import StudentParent from '../models/StudentParent';
import Counter from '../models/Counter';
import Notification from '../models/Notification';
import PaymentTransaction from '../models/PaymentTransaction';
import { generateAccessToken } from '../services/tokenService';
import paymentGatewayService from '../services/paymentGatewayService';
import env from '../config/env';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/finance', financeRoutes);

describe('Payment Gateway Integration & Audit Transactions', () => {
  let parentToken: string;
  let adminToken: string;
  let parentId: mongoose.Types.ObjectId;
  let mockFeeId: mongoose.Types.ObjectId;
  let originalReadyState: number;

  beforeAll(() => {
    originalReadyState = mongoose.connection.readyState;
    Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });

    parentId = new mongoose.Types.ObjectId();
    mockFeeId = new mongoose.Types.ObjectId();

    jest.spyOn(User, 'findById').mockReturnValue({
      select: (jest.fn() as any).mockResolvedValue({
        _id: parentId,
        isActive: true,
        isDeleted: false,
        status: 'Active',
      }),
    } as any);

    jest.spyOn(Parent, 'findOne').mockResolvedValue(null);
    jest.spyOn(Student, 'findOne').mockResolvedValue(null);
    jest.spyOn(Student, 'findById').mockReturnValue({
      select: (jest.fn() as any).mockResolvedValue({ firstName: 'Alice', lastName: 'Student' }),
    } as any);
    jest.spyOn(StudentParent, 'findOne').mockResolvedValue(null);
    jest.spyOn(Counter, 'findOneAndUpdate').mockResolvedValue({ sequence: 101 } as any);
    jest.spyOn(Notification, 'create').mockResolvedValue({} as any);
    jest.spyOn(PaymentTransaction, 'findOne').mockResolvedValue(null);
    jest.spyOn(PaymentTransaction, 'create').mockResolvedValue({} as any);
    jest.spyOn(PaymentTransaction, 'findOneAndUpdate').mockResolvedValue({} as any);

    parentToken = generateAccessToken({
      id: parentId.toString(),
      role: 'Parent',
    });

    adminToken = generateAccessToken({
      id: new mongoose.Types.ObjectId().toString(),
      role: 'Admin',
    });
  });

  afterAll(() => {
    Object.defineProperty(mongoose.connection, 'readyState', { value: originalReadyState, configurable: true });
    jest.restoreAllMocks();
  });

  it('POST /fees/:id/create-payment-order generates order and persists PaymentTransaction', async () => {
    const feeId = new mongoose.Types.ObjectId();
    jest.spyOn(Fee, 'findById').mockResolvedValue({
      _id: feeId,
      studentId: new mongoose.Types.ObjectId(),
      totalAmount: 15000,
      amountPaid: 0,
      status: 'Pending',
    } as any);

    const createTxnSpy = jest.spyOn(PaymentTransaction, 'create').mockResolvedValue({} as any);

    const res = await request(app)
      .post(`/api/finance/fees/${feeId}/create-payment-order`)
      .set('Authorization', `Bearer ${parentToken}`)
      .send({ amount: 5000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.gatewayOrderId).toBeDefined();
    expect(res.body.data.orderSignature).toBeDefined();
    expect(createTxnSpy).toHaveBeenCalled();
  });

  it('POST /fees/:id/pay rejects parent payment without gateway verification fields', async () => {
    const feeId = new mongoose.Types.ObjectId();
    jest.spyOn(Fee, 'findById').mockResolvedValue({
      _id: feeId,
      studentId: new mongoose.Types.ObjectId(),
      totalAmount: 10000,
      amountPaid: 0,
      status: 'Pending',
    } as any);

    const res = await request(app)
      .post(`/api/finance/fees/${feeId}/pay`)
      .set('Authorization', `Bearer ${parentToken}`)
      .send({ amount: 1000 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Missing required payment gateway/i);
  });

  it('POST /fees/:id/pay rejects parent payment with invalid gateway signature', async () => {
    const feeId = new mongoose.Types.ObjectId();
    jest.spyOn(Fee, 'findById').mockResolvedValue({
      _id: feeId,
      studentId: new mongoose.Types.ObjectId(),
      totalAmount: 10000,
      amountPaid: 0,
      status: 'Pending',
    } as any);

    jest.spyOn(paymentGatewayService, 'verifyPayment').mockResolvedValue(false);

    const res = await request(app)
      .post(`/api/finance/fees/${feeId}/pay`)
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        amount: 1000,
        gatewayOrderId: 'ORD_12345',
        gatewayPaymentId: 'PAY_12345',
        signature: 'invalid_forged_signature',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Payment verification failed/i);
  });

  it('POST /webhook rejects unauthenticated webhook missing signature', async () => {
    const res = await request(app)
      .post('/api/finance/webhook')
      .send({ orderId: 'ORD_123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Missing webhook signature/i);
  });

  it('POST /webhook verifies signature and processes payment', async () => {
    const feeId = new mongoose.Types.ObjectId();
    const payload = {
      event: 'payment.captured',
      orderId: 'ORD_WEBHOOK_123',
      paymentId: 'PAY_WEBHOOK_123',
      feeId: feeId.toString(),
      amount: 4500,
    };

    const validSignature = crypto
      .createHmac('sha256', env.PAYMENT_GATEWAY_SECRET || env.JWT_ACCESS_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    const mockFee = {
      _id: feeId,
      studentId: new mongoose.Types.ObjectId(),
      totalAmount: 10000,
      amountPaid: 0,
      status: 'Pending',
      paymentHistory: [] as any[],
      save: (jest.fn() as any).mockResolvedValue(true),
    };

    jest.spyOn(Fee, 'findById').mockResolvedValue(mockFee as any);
    jest.spyOn(PaymentTransaction, 'findOneAndUpdate').mockResolvedValue({} as any);

    const res = await request(app)
      .post('/api/finance/webhook')
      .set('x-razorpay-signature', validSignature)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockFee.save).toHaveBeenCalled();
    expect(mockFee.amountPaid).toBe(4500);
  });

  it('POST /fees/:id/record-manual-payment forbids Parent role', async () => {
    const feeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post(`/api/finance/fees/${feeId}/record-manual-payment`)
      .set('Authorization', `Bearer ${parentToken}`)
      .send({ amount: 2000, note: 'Cash' });

    expect(res.status).toBe(403);
  });
});
