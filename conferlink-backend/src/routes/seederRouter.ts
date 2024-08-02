import express from 'express';
import { seedUsers } from '@/controllers/seeders/userSeeder';

const router = express.Router();

router.post('/user', seedUsers);

export { router as seederRouter };
