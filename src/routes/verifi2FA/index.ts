import express from 'express'
import authMiddleware from '../../middleware/authMiddleware.ts'
import {Verifi2FAController, VerifiFrogetPassword, VerifiRegisterController, VerifiUpdateEmail} from '../../controllers/verifi2FAController/index.ts';
import VerificationRegisterMiddleware from '../../middleware/verificationRegisterMiddleware.ts';
const router = express.Router();

router.post('/login', authMiddleware, Verifi2FAController);
router.post(
    "/register",
    VerificationRegisterMiddleware,
    VerifiRegisterController
);
router.post('/forgotpassword',
    VerifiFrogetPassword
);

router.post('/update_email',
    authMiddleware,
    VerifiUpdateEmail
);

export default router