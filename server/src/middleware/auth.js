import { verifyAccessToken } from '../utils/jwt.js';
import { prisma } from '../config/db.js';
import { errorResponse } from '../utils/response.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        settings: true,
        profile: true
      }
    });

    if (!user) {
      return errorResponse(res, 'User no longer exists.', 401);
    }

    if (user.isSuspended) {
      return errorResponse(res, 'Your account has been suspended. Please contact support.', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired. Please refresh or log in again.', 401);
    }
    return errorResponse(res, 'Invalid authentication token.', 401);
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return errorResponse(res, 'Forbidden: Admin privilege required.', 403);
  }
  next();
};
