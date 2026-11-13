import express from 'express'
import authMiddleware from '../../middleware/authMiddleware.ts'
import TwoFactorController from '../../controllers/twoFactorController/twoFactorController.ts';
const router = express.Router();

router.patch('/two-factor', authMiddleware, TwoFactorController);

export default router