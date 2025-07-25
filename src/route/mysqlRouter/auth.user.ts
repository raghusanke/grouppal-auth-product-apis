import express from 'express';
import { register, login,getAllUsers } from '../../controller/mysqlController/auth.controller';
import { authenticate } from '../../middleware/mysql.auth.middleware';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getAllUsers); 
export default router;
