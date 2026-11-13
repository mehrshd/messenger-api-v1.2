import express from 'express'
import authMiddleware from '../../middleware/authMiddleware.ts'
import { updateEmailController } from '../../controllers/updateEmailController/updateEmailController.ts';
const router = express.Router();

router.post("/update_email", authMiddleware, updateEmailController);

export default router