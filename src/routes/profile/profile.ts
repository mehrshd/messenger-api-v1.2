import express from 'express'
import authMiddleware from '../../middleware/authMiddleware.ts'
import ProfileController from '../../controllers/profileController/profileController.ts';
const router = express.Router();

router.get('/profile', authMiddleware, ProfileController);

export default router