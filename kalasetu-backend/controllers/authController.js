import bcrypt from 'bcryptjs';
import { z } from 'zod';
import Artisan from '../models/artisanModel.js';
import { signJwt, setAuthCookie, clearAuthCookie } from '../utils/generateToken.js';

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
        const artisan = await Artisan.findOne(query);
        if (!artisan || !(await bcrypt.compare(password, artisan.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
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


