/**
 * @file errorMiddleware.js — Centralized Error Handling
 *
 * Two middleware functions mounted at the END of the Express middleware stack
 * in server.js. Together they catch every error in the application and return
 * a consistent JSON error response.
 *
 * Error handling priority (first match wins):
 *  1. Multer file upload errors     → 400 with human-readable message
 *  2. Zod validation errors         → 400 with field-level messages
 *  3. Mongoose validation errors    → 400 with field messages
 *  4. Mongoose duplicate key (11000)→ 409 Conflict with field name
 *  5. Mongoose CastError            → 400 (invalid ObjectId format)
 *  6. JWT errors                    → 401 (invalid or expired token)
 *  7. All other errors              → status from res.statusCode or 500
 *
 * Security: In production, err.stack is stripped from the response to avoid
 * leaking internal file paths and code structure.
 *
 * @exports {Function} notFound     — 404 handler for unmatched routes
 * @exports {Function} errorHandler — Global error handler (4-arg Express signature)
 *
 * @requires zod — To detect ZodError instances
 * @requires multer — To detect MulterError instances
 *
 * @see server.js — Where notFound and errorHandler are mounted (last in the stack)
 * @see utils/asyncHandler.js — Catches async errors and forwards them here
 */

import { z } from 'zod';
import multer from 'multer';

/**
 * 404 Not Found handler.
 * Mounted after all route definitions — catches requests that didn't match any route.
 * Creates an error and passes it to errorHandler via next().
 */
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * Global error handler (Express 4-argument signature).
 * Classifies the error by type and returns a structured JSON response:
 *   { success: false, message: string, stack?: string }
 *
 * The statusCode logic: if a controller already set res.statusCode (e.g., res.status(401)),
 * that code is used. Otherwise, defaults to 500 Internal Server Error.
 */
export const errorHandler = (err, req, res, next) => {
    // Handle Multer file upload errors
    if (err instanceof multer.MulterError) {
        let message = 'File upload error';
        let statusCode = 400;

        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'File is too large. Maximum size is 10MB.';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Invalid file type. Only images (JPEG, PNG, WebP) and PDF documents are allowed.';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Too many files uploaded.';
                break;
            default:
                message = `Upload error: ${err.message}`;
        }

        return res.status(statusCode).json({ success: false, message });
    }

    // Handle multer fileFilter errors thrown as plain Error
    if (err.message && err.message.includes('Invalid file type')) {
        return res.status(400).json({ success: false, message: err.message });
    }

    // Zod validation errors
    if (err instanceof z.ZodError) {
        return res.status(400).json({
            success: false,
            message: err.issues.map(i => i.message).join(', '),
        });
    }

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: messages.join(', '),
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field';
        return res.status(409).json({
            success: false,
            message: `Duplicate value for ${field}`,
        });
    }

    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: `Invalid ${err.path}: ${err.value}`,
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired',
        });
    }

    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    // In production, hide internal error messages for 500s to prevent information leakage
    const message = statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'Server Error'
        : (err.message || 'Server Error');
    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};
