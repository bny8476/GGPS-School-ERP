import crypto from 'crypto';
import env from '../config/env';

export interface PaymentOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  signature: string;
}

export interface IPaymentGatewayService {
  createOrder(options: { amount: number; currency?: string; receipt?: string }): Promise<PaymentOrderResult>;
  verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean>;
}

export class RazorpayPaymentGatewayService implements IPaymentGatewayService {
  private keyId: string;
  private secret: string;

  constructor() {
    this.keyId = env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || process.env.PAYMENT_GATEWAY_KEY_ID || 'rzp_test_SpEf15KaCAj2po';
    this.secret = env.RAZORPAY_KEY_SECRET || env.PAYMENT_GATEWAY_SECRET || 'eZyRCiqqgfbu1lNVbB60CAFH';
  }

  getKeyId(): string {
    return this.keyId;
  }

  async createOrder(options: { amount: number; currency?: string; receipt?: string; notes?: Record<string, any> }): Promise<PaymentOrderResult> {
    const currency = options.currency || 'INR';
    const amountInPaise = Math.round(options.amount * 100);

    // If real Razorpay key is configured, call official Razorpay API to generate live order_id
    if (this.keyId && this.secret && this.keyId.startsWith('rzp_')) {
      try {
        const auth = Buffer.from(`${this.keyId}:${this.secret}`).toString('base64');
        const res = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency,
            receipt: options.receipt || `rcpt_${Date.now()}`,
            notes: options.notes || {},
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          if (data && data.id) {
            const signature = crypto
              .createHmac('sha256', this.secret)
              .update(`${data.id}|${options.amount}|${currency}`)
              .digest('hex');

            return {
              orderId: data.id,
              amount: options.amount,
              currency,
              signature,
            };
          }
        } else {
          const errText = await res.text().catch(() => '');
          console.warn('Razorpay order creation fallback due to API response:', res.status, errText);
        }
      } catch (err) {
        console.warn('Razorpay order creation network fallback:', err);
      }
    }

    // Fallback: Generate cryptographic order
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 90000 + 10000)}`;
    const signature = crypto
      .createHmac('sha256', this.secret)
      .update(`${orderId}|${options.amount}|${currency}`)
      .digest('hex');

    return {
      orderId,
      amount: options.amount,
      currency,
      signature,
    };
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean> {
    if (!orderId || !paymentId || !signature) {
      return false;
    }

    try {
      // Standard Razorpay verification: HMAC_SHA256(orderId + "|" + paymentId, secret) === signature
      const expectedSignature = crypto
        .createHmac('sha256', this.secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (signature.length !== expectedSignature.length) {
        return false;
      }

      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch (err) {
      return false;
    }
  }

  verifyWebhookSignature(payload: string | Record<string, any>, signature: string): boolean {
    if (!signature) {
      return false;
    }

    try {
      const bodyStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac('sha256', this.secret)
        .update(bodyStr)
        .digest('hex');

      if (signature.length !== expectedSignature.length) {
        return false;
      }

      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch (err) {
      return false;
    }
  }
}

export const paymentGatewayService = new RazorpayPaymentGatewayService();
export default paymentGatewayService;
