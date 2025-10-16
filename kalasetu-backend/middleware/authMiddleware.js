import jwt from 'jsonwebtoken';
import Artisan from '../models/artisanModel.js';

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
        next();
    } catch (err) {
        res.status(res.statusCode === 200 ? 401 : res.statusCode);
        next(err);
    }
};


