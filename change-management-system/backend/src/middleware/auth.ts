import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserData } from '../models/User.js';
import { config } from '../config/index.js';

export interface AuthRequest extends Request {
  user?: { id: string };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Not authorized to access this route',
      },
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string };
    const user = await User.findById(parseInt(decoded.id));

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found',
        },
      });
    }

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Not authorized to access this route',
      },
    });
  }
};

export const authorize = (...roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Not authorized',
        },
      });
    }

    const user = await User.findById(parseInt(req.user.id));
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `User role ${user?.role} is not authorized to access this route`,
        },
      });
    }
    next();
  };
};
