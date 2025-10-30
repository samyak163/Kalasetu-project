import bcrypt from 'bcryptjs';
import { z } from 'zod';
import Artisan from '../models/artisanModel.js';
import { signJwt, setAuthCookie, clearAuthCookie } from '../utils/generateToken.js';
import crypto from 'crypto';

const registerSchema = z.object({
    fullName: z.string().min(2),
    email: z.string().email().transform((v) => v.toLowerCase().trim()).optional(),
    phoneNumber: z.string().min(7).max(20).optional(),
    password: z.string().min(8),
}).refine((data) => data.email || data.phoneNumber, {
    message: "Either email or phone number must be provided",
    path: ["email", "phoneNumber"]
});

const loginSchema = z.object({
    loginIdentifier: z.string().min(3),
    password: z.string().min(8),
});

export const register = async (req, res, next) => {
    try {
        const { fullName, email, phoneNumber, password } = registerSchema.parse(req.body);
        
        // Check for existing email if provided
        if (email) {
            const existingEmail = await Artisan.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({ message: 'This email is already registered' });
            }
        }
        
        // Check for existing phone if provided
        if (phoneNumber) {
            const existingPhone = await Artisan.findOne({ phoneNumber });
            if (existingPhone) {
                return res.status(400).json({ message: 'This phone number is already registered' });
            }
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
        
        res.status(201).json({
            _id: artisan._id,
            fullName: artisan.fullName,
            email: artisan.email,
            phoneNumber: artisan.phoneNumber,
            publicId: artisan.publicId,
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.issues.map(i => i.message).join(', ') });
        }
        next(err);
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
  const { loginIdentifier } = req.body;
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
  console.log(`Artisan password reset link for ${artisan.email || artisan.phoneNumber}: ${resetUrl}`);
  res.status(200).json({ message: 'If the account exists, you will receive a reset link.' });
};

// --- Reset Password ---
// @route POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;
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
};


