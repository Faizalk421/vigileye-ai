import { Router } from 'express';
import * as sessionController from '../controllers/sessionController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { createSessionSchema } from '../validators/sessionValidator.js';

const router = Router();

router.use(requireAuth);

router.post('/', validateRequest(createSessionSchema), sessionController.createSession);
router.get('/', sessionController.getSessions);
router.delete('/clear-all', sessionController.clearAllSessions);
router.get('/:id', sessionController.getSessionById);
router.delete('/:id', sessionController.deleteSession);

export default router;
