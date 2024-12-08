import { login } from '@/controllers/auth/login';
import { register } from '@/controllers/auth/register';
import { validateLogin, validateRegister } from '@/middlewares/validateAuth';
import express from 'express';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

export { router as authRouter };
