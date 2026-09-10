import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback to Authorization Header (Bearer token)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. Please log in.', 401);
    }

    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return errorResponse(res, 'The user belonging to this token no longer exists.', 401);
      }

      req.user = user;
      next();
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return errorResponse(res, 'Session expired. Please log in again.', 401);
      }
      return errorResponse(res, 'Invalid authentication token.', 401);
    }
  } catch (error) {
    return next(error);
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 'You do not have permission to perform this action.', 403);
    }
    next();
  };
};
