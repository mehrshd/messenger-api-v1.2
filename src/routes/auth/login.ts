import express from 'express'
import LoginController from '../../controllers/authController/loginController.ts';
const router = express.Router();

router.post('/login', LoginController);

export default router