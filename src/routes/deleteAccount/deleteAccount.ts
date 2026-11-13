import express from 'express'
import authMiddleware from '../../middleware/authMiddleware.ts';
import deleteAccountController from '../../controllers/deleteAccount/deleteAccountController.ts';
const router = express.Router();

router.delete('/delete_account', authMiddleware, deleteAccountController);

export default router