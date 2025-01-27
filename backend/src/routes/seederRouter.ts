import express from 'express';
import { seedUsers } from '@/controllers/seeders/userSeeder';
import { authenticate } from '@/middlewares/validateAuth';

const router = express.Router();

router.post('/user', authenticate, seedUsers);

export { router as seederRouter };
