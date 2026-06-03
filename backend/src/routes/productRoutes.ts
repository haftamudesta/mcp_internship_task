import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authMiddleware } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { ListProductsSchema, CreateProductSchema } from '../types';

const router = Router();
const productController = new ProductController();

router.get('/', validate(ListProductsSchema), productController.listProducts.bind(productController));
router.get('/:id', productController.getProduct.bind(productController));

router.post('/', authMiddleware, validate(CreateProductSchema), productController.createProduct.bind(productController));
router.put('/:id', authMiddleware, productController.updateProduct.bind(productController));
router.delete('/:id', authMiddleware, productController.deleteProduct.bind(productController));

export default router;