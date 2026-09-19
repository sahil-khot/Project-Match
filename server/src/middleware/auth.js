import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const getJwtSecret = () => {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable must be set in production.');
  }
  return process.env.JWT_SECRET || 'pm_secure_jwt_token_secret_key_dev_2026';
};

export const protect = async (req, res, next) => {
  let token;

  // 1. Primary: HTTP-only cookie
  if (req.cookies && req.cookies.pm_token) {
    token = req.cookies.pm_token;
  }
  // 2. Secondary fallback: Authorization Bearer header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated. Please log in to access this resource.'
    });
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated by administration.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session invalid or expired. Please log in again.'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = (req.user.role || '').toLowerCase().trim();
    const allowedRoles = roles.map(r => String(r).toLowerCase().trim());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
};
