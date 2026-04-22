/**
 * @file authController.js — Artisan Authentication
 *
 * Handles registration, login, logout, password reset, and Firebase social auth
 * for ARTISAN accounts only. Customer auth is in userAuthController.js.
 *
 * Endpoints:
 *  POST /api/auth/register        — Register new artisan (email or phone + password)
 *  POST /api/auth/login           — Login with email/phone + password
 *  GET  /api/auth/me              — Get current artisan profile (requires `protect`)
 *  POST /api/auth/logout          — Clear auth cookie
 *  POST /api/auth/forgot-password — Send password reset email
 *  POST /api/auth/reset-password  — Reset password with token
 *  POST /api/auth/firebase-login  — Social login via Firebase ID token
 *
 * On registration:
 *  - Creates Artisan document (password auto-hashed by pre-save hook)
 *  - Indexes artisan in Algolia (non-blocking)
 *  - Sends welcome email via Resend (non-blocking)
 *  - Creates onboarding notifications
 *  - Returns JWT in HTTP-only cookie + CSRF token in response body
 *
 * Auth: Uses `protect` middleware (Artisan model only)
 * Cookie: ks_auth (shared cookie name with users — different model lookups)
 *
 * @see userAuthController.js — Customer (User) authentication
 * @see middleware/authMiddleware.js — `protect` middleware used on /me and /logout
 * @see utils/generateToken.js — JWT signing and cookie helpers
 */

import { z } from 'zod';
import Artisan from '../models/artisanModel.js';
import { signJwt, setAuthCookie, clearAuthCookie } from '../utils/generateToken.js';
import { generateCsrfToken } from '../middleware/csrfMiddleware.js';
import crypto from 'crypto';
import admin from '../config/firebaseAdmin.js';
import { indexArtisan } from '../utils/algolia.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email.js';
import { trackEvent } from '../utils/posthog.js';
import { createNotifications } from '../utils/notificationService.js';
import * as Sentry from '@sentry/node';
// RECAPTCHA_CONFIG import removed - reCAPTCHA disabled for demo (will add back with custom domain)

const registerSchema = z.object({
    fullName: z.string().min(2),
    email: z.preprocess(
        // If value is an empty string, treat it as undefined, otherwise use the value
        (val) => (val === '' ? undefined : val),
        // Now, the regular validation will only run on non-empty strings
        z.string().email().transform((v) => v.toLowerCase().trim()).optional()
    ),
    phoneNumber: z.preprocess(
        // Same logic for phone number
        (val) => (val === '' ? undefined : val),
        z.string().min(7).max(20).optional()
    ),
    password: z.string().min(8),
}).refine((data) => data.email || data.phoneNumber, {
    message: "Either email or phone number must be provided",
    path: ["email", "phoneNumber"]
});

const loginSchema = z.object({
    loginIdentifier: z.string().min(3),
    password: z.string().min(8),
});

const forgotPasswordSchema = z.object({
    loginIdentifier: z.string().min(3, "Email or phone number is required"),
});

const resetPasswordSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const register = async (req, res, next) => {
    try {
        const { fullName, email, phoneNumber, password } = registerSchema.parse(req.body);

        // reCAPTCHA removed for demo - will be added back when going public with custom domain
        
        // Check for existing email/phone in parallel (optimize query)
        const [existingEmail, existingPhone] = await Promise.all([
            email ? Artisan.findOne({ email }).select('_id').lean() : null,
            phoneNumber ? Artisan.findOne({ phoneNumber }).select('_id').lean() : null,
        ]);
        
        if (existingEmail) {
            return res.status(400).json({ message: 'This email is already registered' });
        }
        
        if (existingPhone) {
            return res.status(400).json({ message: 'This phone number is already registered' });
        }
        
        // Create artisan with only provided fields
        // Password hashing is handled by the pre-save hook in artisanModel.js
        const artisanData = { fullName, password, emailVerified: true };
        if (email) artisanData.email = email;
        if (phoneNumber) artisanData.phoneNumber = phoneNumber;
        
        const artisan = await Artisan.create(artisanData);
        const token = signJwt(artisan._id);
        setAuthCookie(res, token);
        
        // Index artisan in Algolia (non-blocking with error capture)
        indexArtisan(artisan).catch(err => {
            if (Sentry) Sentry.captureException(err);
        });

        // Send welcome email only. Artisan email verification is disabled so
        // onboarding is not blocked by email delivery.
        if (artisan.email) {
            sendWelcomeEmail(artisan.email, artisan.fullName).catch(err => {
                if (Sentry) Sentry.captureException(err);
            });
        }

        // Return response WITHOUT sensitive fields
        const artisanPublic = artisan.toObject();
        delete artisanPublic.password;
        delete artisanPublic.resetPasswordToken;
        delete artisanPublic.resetPasswordExpire;
        delete artisanPublic.resetPasswordExpires;
        delete artisanPublic.emailVerificationToken;
        delete artisanPublic.emailVerificationExpires;

        // Track with PostHog if available
        trackEvent(
            artisan._id.toString(),
            'artisan_registered',
            {
                email: artisan.email,
                hasPhone: !!artisan.phoneNumber
            }
        );

        try {
            await createNotifications(artisan._id, 'artisan', [
                {
                    title: 'Welcome to KalaSetu 🎉',
                    text: `Hi ${artisan.fullName.split(' ')[0]}, welcome aboard! Customize your profile to stand out.`,
                    url: '/artisan/dashboard/account',
                },
                {
                    title: 'Complete your profile',
                    text: 'Add your services, portfolio and pricing details so clients can book you faster.',
                    url: '/artisan/dashboard/account',
                },
            ]);
        } catch (notificationError) {
            console.error('Failed to queue artisan onboarding notifications:', notificationError);
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            artisan: artisanPublic,
            csrfToken: generateCsrfToken(artisan._id.toString()),
            redirectTo: '/artisan/dashboard/account'
        });
    } catch (err) {
        console.error('Registration error:', err);
        
        // Send to Sentry if available
        if (Sentry) {
            Sentry.captureException(err);
        }

        if (err instanceof z.ZodError) {
            return res.status(400).json({ 
                success: false,
                message: err.issues.map(i => i.message).join(', ') 
            });
        }

        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

export const login = async (req, res, next) => {
    try {
        const { loginIdentifier, password } = loginSchema.parse(req.body);
        const isEmail = loginIdentifier.includes('@');
        const query = isEmail ? { email: loginIdentifier.toLowerCase().trim() } : { phoneNumber: loginIdentifier };
        const artisan = await Artisan.findOne(query).select('+password +lockUntil +loginAttempts');
        if (!artisan) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        if (artisan.isLocked && artisan.isLocked()) {
            const unlockAt = new Date(artisan.lockUntil).toLocaleTimeString();
            return res.status(423).json({ message: `Account is temporarily locked due to too many failed login attempts. Try again after ${unlockAt}.` });
        }
        const valid = await artisan.matchPassword(password);
        if (!valid) {
            await artisan.incLoginAttempts();
            const remaining = 5 - artisan.loginAttempts;
            return res.status(401).json({ message: `Invalid credentials. ${remaining > 0 ? `${remaining} login attempt(s) left before lockout.` : 'Account locked.'}` });
        }
        artisan.emailVerified = true;
        artisan.emailVerificationToken = undefined;
        artisan.emailVerificationExpires = undefined;
        await artisan.resetLoginAttempts();
        const token = signJwt(artisan._id);
        setAuthCookie(res, token);
        res.json({
            _id: artisan._id,
            fullName: artisan.fullName,
            email: artisan.email,
            emailVerified: artisan.emailVerified,
            publicId: artisan.publicId,
            csrfToken: generateCsrfToken(artisan._id.toString()),
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.issues.map(i => i.message).join(', ') });
        }
        next(err);
    }
};

export const me = async (req, res, next) => {
    try {
        if (req.user.emailVerified !== true) {
            req.user.emailVerified = true;
            req.user.emailVerificationToken = undefined;
            req.user.emailVerificationExpires = undefined;
            await req.user.save({ validateBeforeSave: false });
        }
        const userData = req.user.toObject ? req.user.toObject() : { ...req.user };
        userData.csrfToken = generateCsrfToken(req.user._id.toString());
        res.json(userData);
    } catch (err) {
        next(err);
    }
};

export const logout = async (req, res, next) => {
    try {
        clearAuthCookie(res);
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

// --- Forgot Password ---
// @route POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { loginIdentifier } = forgotPasswordSchema.parse(req.body);
    const query = loginIdentifier.includes('@') ? { email: loginIdentifier.toLowerCase().trim() } : { phoneNumber: loginIdentifier };
    const artisan = await Artisan.findOne(query);
    if (!artisan) {
      return res.status(200).json({ message: 'If the account exists, you will receive a reset link.' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    artisan.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    artisan.resetPasswordExpires = Date.now() + 3600000;
    await artisan.save({ validateBeforeSave: false });
    const resetUrl = `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    // Send password reset email (async, don't wait)
    if (artisan.email) {
        sendPasswordResetEmail(artisan.email, artisan.fullName, resetToken).catch(err => {
            console.error('Failed to send password reset email:', err);
        });
    } else {
        // Fallback for phone-only users
        if (process.env.NODE_ENV !== 'production') { console.log(`Artisan password reset link for ${artisan.phoneNumber}: ${resetUrl}`); }
    }
    
    res.status(200).json({ message: 'If the account exists, you will receive a reset link.' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues.map(i => i.message).join(', ') });
    }
    next(err);
  }
};

// --- Reset Password ---
// @route POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const artisan = await Artisan.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!artisan) {
      return res.status(400).json({ message: 'Invalid or expired password reset token.' });
    }
    // Password hashing is handled by the pre-save hook in artisanModel.js
    artisan.password = newPassword;
    artisan.resetPasswordToken = undefined;
    artisan.resetPasswordExpires = undefined;
    await artisan.save();
    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.issues.map(i => i.message).join(', ') });
    }
    next(err);
  }
};

// --- Firebase Login (Phone/Email Link via Firebase Auth) ---
// @route POST /api/auth/firebase-login
export const firebaseLogin = async (req, res, next) => {
    try {
        const { idToken } = req.body || {};
        if (!idToken) return res.status(400).json({ message: 'idToken is required' });

        // Verify the Firebase ID token
        const decoded = await admin.auth().verifyIdToken(idToken);
        const { uid, phone_number: phoneNumber, email, name } = decoded;

        // Try to find existing artisan by firebaseUid, email or phone
        const findQuery = {
            $or: [
                { firebaseUid: uid },
                ...(email ? [{ email }] : []),
                ...(phoneNumber ? [{ phoneNumber }] : []),
            ],
        };

        let artisan = await Artisan.findOne(findQuery);

        if (!artisan) {
            // Create a new artisan with random password (not used for Firebase auth, but required by schema)
            // Password hashing is handled by the pre-save hook in artisanModel.js
            const randomPass = crypto.randomBytes(16).toString('hex');

            artisan = await Artisan.create({
                firebaseUid: uid,
                fullName: name || 'KalaSetu User',
                email: email || undefined,
                phoneNumber: phoneNumber || undefined,
                password: randomPass,
                emailVerified: true,
            });
            
            // Index new artisan in Algolia (non-blocking with error capture)
            indexArtisan(artisan).catch(err => {
                if (Sentry) Sentry.captureException(err);
            });
        } else if (!artisan.firebaseUid) {
            // Link existing artisan with this Firebase UID if not already linked
            artisan.firebaseUid = uid;
            await artisan.save({ validateBeforeSave: false });
        }

        const token = signJwt(artisan._id);
        setAuthCookie(res, token);

        return res.json({
            _id: artisan._id,
            fullName: artisan.fullName,
            email: artisan.email,
            phoneNumber: artisan.phoneNumber,
            publicId: artisan.publicId,
        });
    } catch (err) {
        console.error('Firebase auth error:', err);
        return res.status(401).json({ message: 'Invalid Firebase token' });
    }
};


