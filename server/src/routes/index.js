import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import sessionRoutes from './sessionRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import adminRoutes from './adminRoutes.js';

const apiRouter = Router();

apiRouter.get('/', (req, res) => {
  res.json({
    name: 'VigilEye AI REST API',
    version: '2.0.0',
    status: 'ONLINE',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        refresh: 'POST /api/auth/refresh',
        forgotPassword: 'POST /api/auth/forgot-password',
        resetPassword: 'POST /api/auth/reset-password',
        verifyEmail: 'POST /api/auth/verify-email',
        twoFactorSetup: 'POST /api/auth/2fa/setup',
        twoFactorVerify: 'POST /api/auth/2fa/verify'
      },
      users: {
        me: 'GET /api/users/me',
        updateProfile: 'PUT /api/users/me',
        updateSettings: 'PUT /api/users/settings',
        securityLogs: 'GET /api/users/security-logs',
        exportData: 'GET /api/users/export-data'
      },
      sessions: {
        create: 'POST /api/sessions',
        list: 'GET /api/sessions',
        detail: 'GET /api/sessions/:id'
      },
      analytics: {
        overview: 'GET /api/analytics/overview',
        charts: 'GET /api/analytics/charts',
        reports: 'GET /api/analytics/reports'
      },
      notifications: {
        list: 'GET /api/notifications',
        markRead: 'PUT /api/notifications/:id/read',
        markAllRead: 'PUT /api/notifications/mark-all-read'
      },
      admin: {
        overview: 'GET /api/admin/overview',
        users: 'GET /api/admin/users',
        analytics: 'GET /api/admin/analytics'
      }
    }
  });
});

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'VigilEye AI Backend API',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/sessions', sessionRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
