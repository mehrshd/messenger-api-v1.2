import express from 'express'
import authMiddleware from '../../middleware/authMiddleware.ts';
import upload from '../../middleware/uploadMiddleware.ts';
import updateProfileController from '../../controllers/updateProfileController/updateProfileController.ts';
const router = express.Router();

router.patch(
    "/updateProfile",
    authMiddleware,
    upload.single('avatar'),
    updateProfileController
);

export default router