import { ProductRepository } from '../repositories/ProductRepository';
import { Product, PaginatedResponse, CreateProductInput } from '../types';
import { prisma } from '../lib/prisma';

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

  async createProduct(data: CreateProductInput): Promise<Product> {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: data.price,
        totalStock: data.totalStock,
        availableStock: data.totalStock // Initially available stock equals total stock
      }
    });
    
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      totalStock: product.totalStock,
      availableStock: product.availableStock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }

  async updateProduct(id: string, data: Partial<CreateProductInput>): Promise<Product | null> {
    const existingProduct = await productRepo.findById(id);
    if (!existingProduct) {
      return null;
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.totalStock !== undefined) {
      const stockDifference = data.totalStock - existingProduct.totalStock;
      updateData.totalStock = data.totalStock;
      updateData.availableStock = existingProduct.availableStock + stockDifference;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      totalStock: product.totalStock,
      availableStock: product.availableStock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }

  async deleteProduct(id: string): Promise<boolean> {
    const existingProduct = await productRepo.findById(id);
    if (!existingProduct) {
      return false;
    }

    await prisma.product.delete({
      where: { id }
    });

    return true;
  }
}