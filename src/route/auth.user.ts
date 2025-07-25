import express from 'express';
import { register, login,getAllUsers } from '../controller/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getAllUsers); 
export default router;
