import express from 'express'
import authMiddleware from '../../middleware/authMiddleware.ts';
import updatePasswordController from '../../controllers/updatePasswordController/updatePasswordController.ts';
const router = express.Router();

router.post("/updatepassword", authMiddleware, updatePasswordController);

export default router