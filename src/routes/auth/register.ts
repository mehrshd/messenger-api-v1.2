import express from 'express'
import RegisterControllers from '../../controllers/authController/RegisterContrillers.ts';
const router = express.Router();

router.post('/register', RegisterControllers);

export default router