import bcrypt from 'bcryptjs';
import { z } from 'zod';
import Artisan from '../models/artisanModel.js';
import { signJwt, setAuthCookie, clearAuthCookie } from '../utils/generateToken.js';
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
        const { fullName, email, phoneNumber, password } = req.body;
        
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
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create artisan with only provided fields
        const artisanData = { fullName, password: hashedPassword };
        if (email) artisanData.email = email;
        if (phoneNumber) artisanData.phoneNumber = phoneNumber;
        
    const artisan = await Artisan.create(artisanData);
        const token = signJwt(artisan._id);
        setAuthCookie(res, token);
        
        // Index artisan in Algolia (non-blocking, fire and forget)
        // Use setTimeout to avoid blocking the response
        setTimeout(() => {
            indexArtisan(artisan).catch(err => {
                console.error('Failed to index artisan in Algolia (non-critical):', err.message);
            });
        }, 0);
        
        
        // Send welcome email and verification email (async, non-blocking)
        if (artisan.email) {
            const { sendWelcomeEmail, sendVerificationEmail } = await import('../utils/email.js');
            const verificationToken = crypto.randomBytes(32).toString('hex');
            
            // Store verification token in background
            setImmediate(() => {
                Artisan.findByIdAndUpdate(
                    artisan._id,
                    {
                        emailVerificationToken: verificationToken,
                        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
                    },
                    { validateBeforeSave: false }
                ).catch(err => {
                    console.error('Failed to save verification token:', err);
                });
            });
            
            // Send emails (non-blocking, fire and forget)
            Promise.allSettled([
                sendWelcomeEmail(artisan.email, artisan.fullName),
                sendVerificationEmail(artisan.email, artisan.fullName, verificationToken)
            ]).then(results => {
                results.forEach((result, index) => {
                    const emailType = index === 0 ? 'welcome' : 'verification';
                    if (result.status === 'rejected') {
                        console.error(`Failed to send ${emailType} email:`, result.reason);
                    }
                });
            });
        }    // Return response WITHOUT sensitive fields
    const artisanPublic = artisan.toObject();
    delete artisanPublic.password;
    delete artisanPublic.resetPasswordToken;
    delete artisanPublic.resetPasswordExpire;

        // Track with PostHog if available
        trackEvent({
            distinctId: artisan._id.toString(),
            event: 'artisan_registered',
            properties: {
                email: artisan.email,
                hasPhone: !!artisan.phoneNumber
            }
        });

        try {
            await createNotifications(artisan._id, 'artisan', [
                {
                    title: 'Welcome to KalaSetu 🎉',
                    text: `Hi ${artisan.fullName.split(' ')[0]}, welcome aboard! Customize your profile to stand out.`,
                    url: '/artisan/dashboard/account',
                },
                {
                    title: 'Verify your email',
                    text: 'We have sent you a verification link. Please verify your email to stay active on KalaSetu.',
                    url: '/artisan/dashboard/account?tab=verification',
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
            token, // Include token in response for frontend
            redirectTo: '/artisan/dashboard/account' // Tell frontend where to redirect
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
        const valid = await bcrypt.compare(password, artisan.password);
        if (!valid) {
            await artisan.incLoginAttempts();
            const remaining = 5 - artisan.loginAttempts;
            return res.status(401).json({ message: `Invalid credentials. ${remaining > 0 ? `${remaining} login attempt(s) left before lockout.` : 'Account locked.'}` });
        }
        await artisan.resetLoginAttempts();
        const token = signJwt(artisan._id);
        setAuthCookie(res, token);
        res.json({
            _id: artisan._id,
            fullName: artisan.fullName,
            email: artisan.email,
            publicId: artisan.publicId,
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
        res.json(req.user);
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
        console.log(`Artisan password reset link for ${artisan.phoneNumber}: ${resetUrl}`);
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
    artisan.password = await bcrypt.hash(newPassword, 10);
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
            // Create a new artisan with random password (not used, but required by schema)
            const randomPass = crypto.randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPass, 10);

            artisan = await Artisan.create({
                firebaseUid: uid,
                fullName: name || 'KalaSetu User',
                email: email || undefined,
                phoneNumber: phoneNumber || undefined,
                password: hashedPassword,
            });
            
            // Index new artisan in Algolia (non-blocking)
            setTimeout(() => {
                indexArtisan(artisan).catch(err => {
                    console.error('Failed to index artisan in Algolia (non-critical):', err.message);
                });
            }, 0);
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


