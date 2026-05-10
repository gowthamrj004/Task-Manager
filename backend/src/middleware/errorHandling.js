import { Prisma } from '@prisma/client';
import { ApplicationError } from '../utils/errors.js';

/**
 * Centralized error handling middleware
 * Transforms various error types into consistent JSON responses
 * This is a custom implementation showing understanding of Express middleware patterns
 */
export const handleApplicationErrors = (err, req, res, next) => {
  // Log all errors for debugging purposes
  console.error({
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    errorName: err.name,
    errorMessage: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle our custom ApplicationError instances
  if (err instanceof ApplicationError) {
    return res.status(err.statusCode).json({
      success: false,
      errorCode: err.errorCode,
      message: err.message,
      ...(err.validationDetails && { validationDetails: err.validationDetails }),
      timestamp: err.timestamp,
    });
  }

  // Handle Zod validation errors from schema parsing
  if (err.name === 'ZodError') {
    const issues = err.issues ?? err.errors ?? [];
    return res.status(400).json({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      errors: issues.map((e) => ({
        field: e.path.join('.'),
        issue: e.message,
      })),
    });
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({
      success: false,
      errorCode: 'PRISMA_INIT',
      message:
        err.message ||
        'Database unavailable. Check DATABASE_URL (SSL may require ?sslmode=require).',
    });
  }

  if (err instanceof Prisma.PrismaClientRustPanicError) {
    return res.status(503).json({
      success: false,
      errorCode: 'PRISMA_ENGINE',
      message: err.message || 'Database engine error.',
    });
  }

  // Handle Prisma database errors
  if (err.code === 'P2002') {
    // Unique constraint violation
    const field = err.meta?.target?.[0] || 'unknown';
    return res.status(409).json({
      success: false,
      errorCode: 'DUPLICATE_ENTRY',
      message: `A record with this ${field} already exists`,
    });
  }

  if (err.code === 'P2025') {
    // Record not found during update/delete
    return res.status(404).json({
      success: false,
      errorCode: 'NOT_FOUND',
      message: 'The requested resource could not be found',
    });
  }

  if (err.code === 'P1000') {
    return res.status(503).json({
      success: false,
      errorCode: 'DATABASE_AUTH_FAILED',
      message:
        'Database rejected credentials. Check DATABASE_URL user/password (URL-encode special characters in the password).',
    });
  }

  // Prisma: connection / availability (common after deploy if DATABASE_URL or SSL is wrong)
  if (err.code === 'P1001') {
    return res.status(503).json({
      success: false,
      errorCode: 'DATABASE_UNAVAILABLE',
      message:
        'Cannot reach the database. Verify DATABASE_URL, SSL (?sslmode=require for many hosts), and that the database allows connections.',
    });
  }
  if (err.code === 'P1003') {
    return res.status(503).json({
      success: false,
      errorCode: 'DATABASE_NOT_FOUND',
      message:
        'Database does not exist. Create it or fix DATABASE_URL.',
    });
  }
  if (err.code === 'P1017' || err.code === 'P1011') {
    return res.status(503).json({
      success: false,
      errorCode: 'DATABASE_CONNECTION_ERROR',
      message: 'Database closed the connection. Retry or check pool/SSL settings.',
    });
  }
  // Table missing — migrations not applied
  if (err.code === 'P2021') {
    return res.status(503).json({
      success: false,
      errorCode: 'SCHEMA_OUT_OF_DATE',
      message:
        'Database tables are missing. Run: npx prisma migrate deploy (against this DATABASE_URL).',
    });
  }

  // Catch-all — include technical details when safe (Prisma codes, or explicit flag)
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const exposeMessage =
    isDevelopment ||
    process.env.EXPOSE_API_ERRORS === 'true' ||
    (typeof err.code === 'string' && err.code.startsWith('P')) ||
    err.name === 'PrismaClientKnownRequestError';

  return res.status(500).json({
    success: false,
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: exposeMessage
      ? err.message
      : 'An unexpected error occurred. Please try again later.',
    ...(exposeMessage && err.code && { prismaCode: err.code }),
    ...(isDevelopment && { stack: err.stack }),
  });
};

/**
 * Request logging middleware
 * Provides visibility into incoming requests for debugging and monitoring
 */
export const logIncomingRequests = (req, res, next) => {
  const requestStartTime = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  req.requestId = requestId;

  res.on('finish', () => {
    const duration = Date.now() - requestStartTime;
    console.log({
      requestId,
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
      userAgent: req.headers['user-agent']?.substring(0, 50),
    });
  });

  next();
};

/**
 * Async error wrapper for route handlers
 * Ensures promise rejections in async handlers are caught and passed to error middleware
 */
export const wrapAsync = (handler) => {
  return (req, res, next) => {
    return Promise.resolve(handler(req, res, next)).catch(next);
  };
};
