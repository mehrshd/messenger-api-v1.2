import express from 'express'
import {forgotPassword_sendNewPassword, forgotPasswordCntrl_sendCode, forgotPasswordCntrl_sendEmail} from '../../controllers/forgotpassController/forgotpassController.ts';
const router = express.Router();

router.post("/sendemail", forgotPasswordCntrl_sendEmail);
router.post("/sendcode", forgotPasswordCntrl_sendCode);
router.post("/sendnewpassword", forgotPassword_sendNewPassword);

export default router