/**
 * @file authMiddleware.js — Core Authentication Middleware (Artisan, Admin, Any)
 *
 * Provides the primary auth guards for KalaSetu's dual-auth system.
 * All middleware reads JWT from HTTP-only cookies, verifies it, and
 * attaches the authenticated account to `req.user`.
 *
 * KalaSetu has THREE separate auth flows — choosing the wrong middleware is a common bug:
 *
 *  ┌─────────────┬───────────────┬──────────────┬──────────────────────────┐
 *  │ Middleware   │ Cookie        │ Model        │ Use for                  │
 *  ├─────────────┼───────────────┼──────────────┼──────────────────────────┤
 *  │ protect     │ ks_auth       │ Artisan      │ Artisan-only routes      │
 *  │ protectAdmin│ admin_token   │ Admin        │ Admin panel routes       │
 *  │ protectAny  │ ks_auth       │ User/Artisan │ Routes for either type   │
 *  │ userProtect │ ks_auth       │ User         │ User-only routes         │
 *  └─────────────┴───────────────┴──────────────┴──────────────────────────┘
 *
 *  Note: userProtect lives in userProtectMiddleware.js (separate file)
 *
 * What each middleware sets on `req`:
 *  - protect:      req.user (Artisan doc), req.user.id (string)
 *  - protectAdmin: req.user (Admin doc)
 *  - protectAny:   req.user (User or Artisan doc), req.user.id (string),
 *                  req.account (same as req.user), req.accountType ('user' | 'artisan')
 *
 * @exports {Function} protect         — Artisan-only auth guard
 * @exports {Function} protectAdmin    — Admin-only auth guard (reads admin_token cookie)
 * @exports {Function} checkPermission — Admin granular permission check (resource + action)
 * @exports {Function} protectAny      — Either user type auth guard (tries User first, then Artisan)
 *
 * @requires jsonwebtoken — JWT verification
 * @requires ../models/artisanModel.js — Artisan model lookup
 * @requires ../models/userModel.js — User model lookup (for protectAny)
 *
 * @see userProtectMiddleware.js — User-only auth guard (separate file)
 * @see routes/* — Each route file documents which middleware it uses
 * @see config/env.config.js — JWT_CONFIG (secret, cookie name, expiry)
 */

import jwt from 'jsonwebtoken';
import Artisan from '../models/artisanModel.js';
import User from '../models/userModel.js';

/**
 * Artisan-only authentication middleware.
 * Reads JWT from `ks_auth` cookie → verifies → looks up Artisan model.
 *
 * Sets: req.user (Artisan document, without password)
 * Sets: req.user.id (string version of _id)
 *
 * Use on: /api/artisan/* (profile management, dashboard, services, portfolio)
 */
export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.[process.env.COOKIE_NAME || 'ks_auth'];
        if (!token) {
            res.status(401);
            throw new Error('Not authenticated');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Reject tokens explicitly typed as non-artisan (backward compat: accept undefined type)
        if (decoded.type && decoded.type !== 'artisan') {
            res.status(401);
            throw new Error('Not authenticated');
        }
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


/**
 * Admin-only authentication middleware.
 * Reads JWT from `admin_token` cookie (separate from ks_auth).
 * Verifies the token contains role='admin', looks up Admin model,
 * and checks the account is active (not suspended).
 *
 * Sets: req.user (Admin document)
 *
 * Use on: /api/admin/* (dashboard, user management, moderation)
 *
 * Note: Admin model is dynamically imported to avoid circular dependency
 * since adminModel.js is rarely loaded in non-admin request paths.
 */
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

/**
 * Granular permission check for admin routes.
 * Must be used AFTER protectAdmin (needs req.user.permissions to exist).
 *
 * Checks: req.user.permissions[resource][action] === true
 *
 * @param {string} resource — Permission resource (e.g., 'artisans', 'payments', 'reviews')
 * @param {string} action   — Permission action (e.g., 'read', 'write', 'delete')
 * @returns {Function} Express middleware
 *
 * @example
 *   router.delete('/artisan/:id', protectAdmin, checkPermission('artisans', 'delete'), handler)
 */
export const checkPermission = (resource, action) => {
    return (req, res, next) => {
        if (!req?.user?.permissions?.[resource] || req.user.permissions[resource][action] !== true) {
            res.status(403);
            return next(new Error('You do not have permission to perform this action'));
        }
        next();
    };
};

/**
 * Either-type authentication middleware (User OR Artisan).
 * Reads JWT from `ks_auth` cookie → queries BOTH User and Artisan collections
 * in parallel → attaches whichever account is found.
 *
 * Sets: req.user (User or Artisan document, without password)
 * Sets: req.user.id (string version of _id)
 * Sets: req.account (same reference as req.user)
 * Sets: req.accountType ('user' | 'artisan')
 *
 * Use on: Routes accessible to both user types — bookings, payments, chat,
 *         video calls, notifications, uploads, support tickets
 *
 * Priority: Checks User first, then Artisan. If the same ID exists in both
 * collections (shouldn't happen), the User account wins.
 */
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

