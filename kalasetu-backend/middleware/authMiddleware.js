import jwt from 'jsonwebtoken';
import Artisan from '../models/artisanModel.js';
import User from '../models/userModel.js';

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.[process.env.COOKIE_NAME || 'ks_auth'];
        if (!token) {
            res.status(401);
            throw new Error('Not authenticated');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Artisan.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401);
            throw new Error('User not found');
        }
        req.user = user;
        req.user.id = user._id.toString();
        next();
    } catch (err) {
        res.status(res.statusCode === 200 ? 401 : res.statusCode);
        next(err);
    }
};


export const protectAdmin = async (req, res, next) => {
    try {
        const token = req.cookies?.admin_token;
        if (!token) {
            res.status(401);
            throw new Error('Not authorized to access this route');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            res.status(403);
            throw new Error('Admin access required');
        }
        const { default: Admin } = await import('../models/adminModel.js');
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            res.status(401);
            throw new Error('Admin not found');
        }
        if (!admin.isActive) {
            res.status(403);
            throw new Error('Admin account is suspended');
        }
        req.user = admin;
        next();
    } catch (err) {
        res.status(res.statusCode === 200 ? 401 : res.statusCode);
        next(err);
    }
};

export const checkPermission = (resource, action) => {
    return (req, res, next) => {
        if (!req?.user?.permissions?.[resource] || req.user.permissions[resource][action] !== true) {
            res.status(403);
            return next(new Error('You do not have permission to perform this action'));
        }
        next();
    };
};

export const protectAny = async (req, res, next) => {
    try {
        const token = req.cookies?.[process.env.COOKIE_NAME || 'ks_auth'];
        if (!token) {
            res.status(401);
            throw new Error('Not authenticated');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [userAccount, artisanAccount] = await Promise.all([
            User.findById(decoded.id).select('-password'),
            Artisan.findById(decoded.id).select('-password')
        ]);

        if (userAccount) {
            req.user = userAccount;
            req.user.id = userAccount._id.toString();
            req.account = userAccount;
            req.accountType = 'user';
            return next();
        }

        if (artisanAccount) {
            req.user = artisanAccount;
            req.user.id = artisanAccount._id.toString();
            req.account = artisanAccount;
            req.accountType = 'artisan';
            return next();
        }

        res.status(401);
        throw new Error('Not authenticated');
    } catch (err) {
        res.status(res.statusCode === 200 ? 401 : res.statusCode);
        next(err);
    }
};

