import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'; // <-- IMPORTANT: Imports User model

// This middleware protects routes that only logged-in USERS can access.
const userProtect = async (req, res, next) => {
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME || 'ks_auth'];

    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
