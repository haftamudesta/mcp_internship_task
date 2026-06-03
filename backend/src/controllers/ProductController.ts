import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { ListProductsSchema, ApiResponse, PaginatedResponse } from '../types';
import { Product } from '../types';

const productService = new ProductService();

export class ProductController {
  async listProducts(
    req: Request, 
    res: Response<ApiResponse<PaginatedResponse<Product>>>
  ) {
    const validation = ListProductsSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    const { page, limit, sortBy, sortOrder, search } = validation.data;
    const result = await productService.listProducts({
      page,
      limit,
      sortBy,
      sortOrder,
      search
    });

    res.json({
      success: true,
      data: result
    });
  }

  async getProduct(
    req: Request, 
    res: Response<ApiResponse<Product>>
  ) {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  }
}