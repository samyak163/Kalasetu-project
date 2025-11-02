import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/userModel.js'; // <-- IMPORTANT: Imports User model

// This middleware protects routes that only logged-in CUSTOMERS can access.
const userProtect = asyncHandler(async (req, res, next) => {
  let token;

  // Read the JWT from the HTTP-only cookie (use the same cookie name as generateToken)
  token = req.cookies?.[process.env.COOKIE_NAME || 'ks_auth'];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the USER by the ID in the token (use 'id' to match generateToken)
      // We exclude the password field from being returned
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      return next(); // User is found, proceed to the next middleware/controller
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
});

export { userProtect };
