import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().default('in-memory'),
  JWT_ACCESS_SECRET: z.string().min(8, 'JWT Access Secret must be at least 8 characters'),
  JWT_SECRET: z.string().min(8).optional(),
  JWT_REFRESH_SECRET: z.string().min(8, 'JWT Refresh Secret must be at least 8 characters').optional(),
  PAYMENT_GATEWAY_SECRET: z.string().min(8).optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('24h'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  CORS_ORIGINS: z.string().optional(),
  REDIS_URL: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
});

const isDevOrTest = !process.env.NODE_ENV || ['development', 'test'].includes(process.env.NODE_ENV);

// Normalize environment aliases for backward compatibility
const rawSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
if (!isDevOrTest && (!rawSecret || rawSecret.includes('super_secret_jwt_school_erp_token_key_2026'))) {
  console.error('FATAL: A secure, non-default JWT_ACCESS_SECRET must be configured in non-development environments');
  process.exit(1);
}

const rawEnv = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI || (isDevOrTest ? 'in-memory' : ''),
  JWT_ACCESS_SECRET: rawSecret || 'super_secret_jwt_school_erp_token_key_2026',
  JWT_SECRET: rawSecret || 'super_secret_jwt_school_erp_token_key_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || (rawSecret ? `${rawSecret}_refresh` : 'super_secret_refresh_token_key_2026'),
  PAYMENT_GATEWAY_SECRET: process.env.PAYMENT_GATEWAY_SECRET || process.env.RAZORPAY_KEY_SECRET || rawSecret || 'super_secret_payment_gateway_key_2026',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || process.env.PAYMENT_GATEWAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || process.env.PAYMENT_GATEWAY_SECRET || '',
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
  CLIENT_URL: process.env.CLIENT_URL || process.env.FRONTEND_URL,
  CORS_ORIGINS: process.env.CORS_ORIGINS,
  REDIS_URL: process.env.REDIS_URL,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
};

// In production, strictly enforce no fallback secrets or empty DB URIs
if (!isDevOrTest) {
  if (!rawSecret) {
    console.error('FATAL: JWT_ACCESS_SECRET / JWT_SECRET must be configured in production/staging');
    process.exit(1);
  }
  if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
    console.error('FATAL: MONGODB_URI / MONGO_URI must be configured in production/staging');
    process.exit(1);
  }
}

const parsedEnv = envSchema.safeParse(rawEnv);

if (!parsedEnv.success) {
  console.error('FATAL: Invalid environment configuration:', parsedEnv.error.format());
  process.exit(1);
}

export const env = {
  ...parsedEnv.data,
  JWT_SECRET: parsedEnv.data.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: parsedEnv.data.JWT_REFRESH_SECRET || `${parsedEnv.data.JWT_ACCESS_SECRET}_refresh`,
  PAYMENT_GATEWAY_SECRET: parsedEnv.data.PAYMENT_GATEWAY_SECRET || `${parsedEnv.data.JWT_ACCESS_SECRET}_pay`,
  RAZORPAY_KEY_ID: parsedEnv.data.RAZORPAY_KEY_ID || 'rzp_test_SpEf15KaCAj2po',
  RAZORPAY_KEY_SECRET: parsedEnv.data.RAZORPAY_KEY_SECRET || parsedEnv.data.PAYMENT_GATEWAY_SECRET || 'eZyRCiqqgfbu1lNVbB60CAFH',
};

export default env;
