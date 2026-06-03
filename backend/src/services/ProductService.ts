import { ProductRepository } from '../repositories/ProductRepository';
import { Product, PaginatedResponse } from '../types';

const productRepo = new ProductRepository();

export class ProductService {
  async listProducts(filters: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    search?: string;
  }): Promise<PaginatedResponse<Product>> {
    const { page, limit, sortBy, sortOrder, search } = filters;
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [products, total] = await Promise.all([
      productRepo.findAll({ skip, take: limit, where, orderBy }),
      productRepo.getTotalCount(where)
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getProductById(id: string): Promise<Product | null> {
    return productRepo.findById(id);
  }
}