import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ENV } from '../config/env.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// Helper to sign JWT
const signToken = (id) => {
  return jwt.sign({ id }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });
};

// Helper to set HTTP-only cookie and send JSON response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  return successResponse(
    res,
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
      token,
    },
    message,
    statusCode
  );
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Please provide name, email and password', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists', 409);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'admin',
    });

    return sendTokenResponse(user, 201, res, 'User registered successfully');
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Please provide email and password', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      console.warn(`[Auth] Failed login attempt for email: ${email}`);
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn(`[Auth] Invalid password for email: ${email}`);
      return errorResponse(res, 'Invalid credentials', 401);
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    console.log(`[Auth] User logged in: ${user.email} (${user.role})`);
    return sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return successResponse(res, {
      user: req.user,
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return successResponse(res, {}, 'Logged out successfully');
  } catch (error) {
    return next(error);
  }
};
