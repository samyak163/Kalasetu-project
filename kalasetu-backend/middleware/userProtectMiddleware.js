/**
 * @file userProtectMiddleware.js — Customer (User) Authentication Middleware
 *
 * Guards routes that are exclusively for logged-in CUSTOMERS (not artisans).
 * Reads JWT from `ks_auth` cookie → verifies → looks up User model only.
 *
 * This is the User-side counterpart to `protect` in authMiddleware.js:
 *  - protect      → Artisan model only
 *  - userProtect  → User model only   (this file)
 *  - protectAny   → Either model
 *
 * Sets: req.user (User document, without password)
 * Sets: req.user.id (string version of _id)
 *
 * Use on: /api/users/me, /api/users/logout, review creation,
 *         and any route that should ONLY be accessible to customers
 *
 * @exports {Function} userProtect — Customer-only auth guard
 *
 * @requires jsonwebtoken — JWT verification
 * @requires ../models/userModel.js — User model lookup
 *
 * @see authMiddleware.js — protect (artisan), protectAdmin (admin), protectAny (either)
 */

import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

/**
 * Customer-only authentication middleware.
 * If the JWT belongs to an artisan, this will return 401
 * (the ID won't be found in the User collection).
 */
const userProtect = async (req, res, next) => {
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME || 'ks_auth'];

    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Reject tokens explicitly typed as non-user (backward compat: accept undefined type)
    if (decoded.type && decoded.type !== 'user') {
      res.status(401);
      throw new Error('Not authorized, invalid token type');
    }

    // Find the USER by the ID in the token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    req.user = user;
    req.user.id = user._id.toString();
    next();
  } catch (err) {
    res.status(res.statusCode === 200 ? 401 : res.statusCode);
    next(err);
  }
};

export { userProtect };
