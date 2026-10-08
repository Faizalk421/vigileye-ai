import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import {
  updateProfileSchema,
  updateSettingsSchema,
  changePasswordSchema
} from '../validators/userValidator.js';

const router = Router();

router.use(requireAuth);

router.get('/me', userController.getMe);
router.put('/me', validateRequest(updateProfileSchema), userController.updateMe);
router.delete('/me', userController.deleteAccount);
router.put('/settings', validateRequest(updateSettingsSchema), userController.updateSettings);
router.post('/change-password', validateRequest(changePasswordSchema), userController.changePassword);
router.get('/security-logs', userController.getSecurityLogs);
router.post('/revoke-sessions', userController.revokeAllSessions);
router.get('/export-data', userController.exportUserData);

export default router;
