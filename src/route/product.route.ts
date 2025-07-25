import express from 'express';
import { addProduct, getAllProducts } from '../controller/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/isAdmin.middleware';

const router = express.Router();

router.post('/addProduct', authenticate, isAdmin, addProduct);

router.get('/', authenticate, getAllProducts);

export default router;
