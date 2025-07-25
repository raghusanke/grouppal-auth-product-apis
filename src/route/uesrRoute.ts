import express from 'express';
import { signup, login, getProfile } from '../controller/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();
router.post('/signup', signup);
router.post('/signin', login);
router.get('/profile', authMiddleware,getProfile);

export default router;
