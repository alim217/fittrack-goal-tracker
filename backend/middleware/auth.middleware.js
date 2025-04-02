<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE structure SYSTEM "https://www.swissprot.org/structure.dtd">
<structure>
const jwt = require('jsonwebtoken');
const User = require('../models/User.model.js');

// Environment variable check - Ensure JWT_SECRET is available
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // This check might be redundant if auth.controller already does it,
  // but ensures the middleware won't run without a secret.
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables. Authentication middleware cannot function.');
  // In a real scenario, a more graceful startup failure might be handled in server.js
  // For simplicity here, we log and potentially let the app fail later if used without a secret.
  // Avoid exiting the process directly within middleware during module load.
}

/**
 * Express middleware to protect routes by verifying JWT.
 * Extracts token from Authorization header, verifies it,
 * checks if the user still exists, and attaches user ID to req.user.
 * Passes errors with statusCode 401 for auth failures to the global error handler.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Token Extraction
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    // Extract token from "Bearer <token>"
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    const error = new Error('Not authorized, no token');
    error.statusCode = 401;
    return next(error);
  }

  // 2. Token Verification & User Validation
  try {
    // Verify token using the secret
    const decoded = jwt.verify(token, JWT_SECRET);

    // decoded payload should contain { userId } as set in auth.controller
    if (!decoded || !decoded.userId) {
        throw new jwt.JsonWebTokenError('Invalid token payload');
    }

    // (Recommended Security Step) Check if user still exists in DB
    // Select only '_id' for efficiency as we just need to confirm existence
    const userExists = await User.findById(decoded.userId).select('_id');

    if (!userExists) {
      // Throw an error that will be caught and handled as a 401
      throw new Error('User belonging to this token no longer exists');
    }

    // Attach user ID to the request object for use in subsequent controllers
    // Ensure structure matches expectation in goal.controller.js: req.user.id
    req.user = { id: decoded.userId };

    // Proceed to the next middleware/route handler
    next();

  } catch (error) {
    // 3. Error Handling for verification failures or user non-existence
    console.error('Authentication Error:', error.message); // Log specific error for debugging

    // Create a generic authentication error to send to the client
    const authError = new Error('Not authorized, token failed');
    authError.statusCode = 401;

    // Pass the generic error to the global error handler
    next(authError);
  }
};

module.exports = {
  protect,
};