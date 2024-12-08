import { deleteUser, getUser, getUsers, updateUser } from '@/controllers';
import { authenticate } from '@/middlewares/validateAuth';
import express from 'express';

const router = express.Router();

router.get('/', authenticate, getUsers);
router.get('/:id', authenticate, getUser);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);

export { router as userRouter };
