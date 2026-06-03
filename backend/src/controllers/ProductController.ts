import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { ListProductsSchema, CreateProductSchema, ApiResponse, PaginatedResponse } from '../types';
import { Product } from '../types';

const productService = new ProductService();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export class ProductController {
  async listProducts(
    req: Request, 
    res: Response<ApiResponse<PaginatedResponse<Product>>>
  ): Promise<Response> {
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

    return res.json({
      success: true,
      data: result
    });
  }

  async getProduct(
    req: Request, 
    res: Response<ApiResponse<Product>>
  ): Promise<Response> {
    // Handle params.id properly - ensure it's a string
    const { id } = req.params;
    const productId = Array.isArray(id) ? id[0] : id;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
        message: 'Product ID is required'
      });
    }
    
    const product = await productService.getProductById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    return res.json({
      success: true,
      data: product
    });
  }

  async createProduct(
    req: AuthRequest,
    res: Response<ApiResponse<Product>>
  ): Promise<Response> {
    const validation = CreateProductSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    try {
      const product = await productService.createProduct(validation.data);
      
      return res.status(201).json({
        success: true,
        data: product,
        message: 'Product created successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Product creation failed';
      return res.status(500).json({
        success: false,
        error: 'Product creation failed',
        message: errorMessage
      });
    }
  }

  async updateProduct(
    req: AuthRequest,
    res: Response<ApiResponse<Product>>
  ): Promise<Response> {
    // Handle params.id properly - ensure it's a string
    const { id } = req.params;
    const productId = Array.isArray(id) ? id[0] : id;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
        message: 'Product ID is required'
      });
    }
    
    const validation = CreateProductSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    try {
      const product = await productService.updateProduct(productId, validation.data);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      return res.json({
        success: true,
        data: product,
        message: 'Product updated successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Product update failed';
      return res.status(500).json({
        success: false,
        error: 'Product update failed',
        message: errorMessage
      });
    }
  }

  async deleteProduct(
    req: AuthRequest,
    res: Response<ApiResponse<null>>
  ): Promise<Response> {
    // Handle params.id properly - ensure it's a string
    const { id } = req.params;
    const productId = Array.isArray(id) ? id[0] : id;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID',
        message: 'Product ID is required'
      });
    }
    
    try {
      const deleted = await productService.deleteProduct(productId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }

      return res.json({
        success: true,
        data: null,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Product deletion failed';
      return res.status(500).json({
        success: false,
        error: 'Product deletion failed',
        message: errorMessage
      });
    }
  }
}