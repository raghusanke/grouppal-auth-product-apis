import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  updateProduct,
} from '../controller/ProductController';
import { authMiddleware } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/isAdmin.middleware';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);

router.post('/addProducts', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;
