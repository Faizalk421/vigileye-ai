import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(requireAuth, requireAdmin);

router.get('/overview', adminController.getAdminOverview);
router.get('/users', adminController.getAdminUsers);
router.get('/users/:id', adminController.getAdminUserById);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.delete('/users/:id', adminController.deleteUserByAdmin);
router.get('/analytics', adminController.getAdminAnalytics);

export default router;
