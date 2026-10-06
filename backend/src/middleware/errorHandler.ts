import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import logger from '../utils/logger';
import env from '../config/env';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let errors: any[] | undefined = undefined;

  // 1. Handled custom ApiError
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    code = `API_ERROR_${statusCode}`;
  }
  // 2. Mongoose Validation Error
  else if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    const errorDetails = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    message = errorDetails.map((d: any) => d.message).join('. ') || 'Form validation failed. Please check the entered values.';
    errors = errorDetails;
  }
  // 3. Mongoose CastError (e.g. invalid ObjectId)
  else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID_FORMAT';
    message = `Resource not found or invalid format for identifier`;
  }
  // 4. MongoDB Duplicate Key Error (code 11000)
  else if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY_ERROR';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `A record with this ${field} ('${value}') already exists in the system`;
  }
  // 5. JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Authentication token is invalid or malformed';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication session has expired. Please sign in again';
  }
  // 6. Zod Error (if passed directly)
  else if (err.name === 'ZodError' && err.issues) {
    statusCode = 400;
    code = 'SCHEMA_VALIDATION_ERROR';
    const cleanErrors = err.issues.map((i: any) => ({
      field: i.path.filter((p: any) => p !== 'body' && p !== 'query' && p !== 'params').join('.') || 'general',
      message: i.message,
    }));
    errors = cleanErrors;
    message = cleanErrors.map((i: any) => i.message).join('. ') || 'Please correct the invalid fields.';
  }

  // Structured Logging
  logger.error(
    {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      code,
      message,
      stack: env.NODE_ENV !== 'production' ? err.stack : undefined,
    },
    'Request error handled'
  );

  res.status(statusCode).json({
    success: false,
    message: env.NODE_ENV === 'production' && statusCode === 500 ? 'An unexpected error occurred' : message,
    code,
    errors,
    ...(env.NODE_ENV !== 'production' && statusCode === 500 ? { stack: err.stack } : {}),
  });
};

export default errorHandler;
