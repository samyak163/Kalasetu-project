import bcrypt from 'bcryptjs';
import { z } from 'zod';
import Artisan from '../models/artisanModel.js';
import { signJwt, setAuthCookie, clearAuthCookie } from '../utils/generateToken.js';

const registerSchema = z.object({
    fullName: z.string().min(2),
    email: z.string().email().transform((v) => v.toLowerCase().trim()),
    phoneNumber: z.string().min(7).max(20),
    password: z.string().min(8),
    craft: z.string().min(2),
    location: z.string().min(2),
});

const loginSchema = z.object({
    loginIdentifier: z.string().min(3),
    password: z.string().min(8),
});

export const register = async (req, res, next) => {
    try {
        const { fullName, email, phoneNumber, password, craft, location } = registerSchema.parse(req.body);
        const existingEmail = await Artisan.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'This email is already registered' });
        }
        const existingPhone = await Artisan.findOne({ phoneNumber });
        if (existingPhone) {
            return res.status(400).json({ message: 'This phone number is already registered' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const artisan = await Artisan.create({ fullName, email, phoneNumber, password: hashedPassword, craft, location });
        const token = signJwt(artisan._id);
        setAuthCookie(res, token);
        res.status(201).json({
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


