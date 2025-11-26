import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserSQL } from '../models/UserSQL.js';
import { config } from '../config/index.js';
import type { AuthRequest } from '../middleware/auth.js';

// Generate JWT Token
const generateToken = (id: number): string => {
  return jwt.sign({ id: id.toString() }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username, first_name, last_name, department, role } = req.body;

    // Check if user exists
    const userExists = await UserSQL.findByEmail(email);
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User already exists',
        },
      });
    }

    // Create user
    const user = await UserSQL.create({
      email,
      username: username || email.split('@')[0],
      password,
      first_name,
      last_name,
      department,
      role: role || 'user',
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: UserSQL.formatUser(user),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Server error',
      },
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide email and password',
        },
      });
    }

    // Check for user (need password hash)
    const user = await UserSQL.findByEmail(email);
    if (!user || !user.password_hash) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
        },
      });
    }

    // Check if password matches
    const isMatch = await UserSQL.comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid credentials',
        },
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: UserSQL.formatUser(user),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Server error',
      },
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authorized',
        },
      });
    }

    const user = await UserSQL.findById(parseInt(req.user.id));
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: UserSQL.formatUser(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error instanceof Error ? error.message : 'Server error',
      },
    });
  }
};
