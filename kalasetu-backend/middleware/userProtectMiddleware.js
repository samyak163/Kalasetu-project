import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/userModel.js'; // <-- IMPORTANT: Imports User model

// This middleware protects routes that only logged-in CUSTOMERS can access.
const userProtect = asyncHandler(async (req, res, next) => {
  let token;

  // Read the JWT from the HTTP-only cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find the USER by the ID in the token
      // We exclude the password field from being returned
      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next(); // User is found, proceed to the next middleware/controller
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export { userProtect };
