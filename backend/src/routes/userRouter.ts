import { getUser, getUsers, updateUser } from '@/controllers';
import { authenticate } from '@/middlewares/validateAuth';
import express from 'express';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);

export { router as userRouter };
