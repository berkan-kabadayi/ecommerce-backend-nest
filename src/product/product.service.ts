import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from 'generated/prisma/browser';

function isErrorWithCode(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string'
  );
}

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    if (createProductDto.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: createProductDto.categoryId },
      });
      if (!categoryExists) {
        throw new NotFoundException('Category not found.');
      }
    }

    try {
      return await this.prisma.product.create({
        data: {
          name: createProductDto.name,
          slug: createProductDto.slug,
          shortDescription: createProductDto.shortDescription,
          longDescription: createProductDto.longDescription,
          price: createProductDto.price,
          stockQuantity: createProductDto.stockQuantity,
          categoryId: createProductDto.categoryId,
        },
      });
    } catch (error) {
      if (isErrorWithCode(error) && error.code === 'P2002') {
        throw new ConflictException('This slug is already in use.');
      }
      throw error;
    }
  }

  async findAll(queryDto: ProductQueryDto) {
    const { category_id, min_price, max_price, min_rating, sort } = queryDto;

    const where: Prisma.ProductWhereInput = {};

    if (category_id) {
      where.categoryId = category_id;
    }

    if (min_price !== undefined || max_price !== undefined) {
      where.price = {};
      if (min_price !== undefined) where.price.gte = min_price;
      if (max_price !== undefined) where.price.lte = max_price;
    }

    if (min_rating !== undefined) {
      where.averageRating = { gte: min_rating };
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

    if (sort) {
      const [field, direction] = sort.split(':');

      const orderDirection: 'asc' | 'desc' =
        direction === 'desc' ? 'desc' : 'asc';

      if (field === 'price') {
        orderBy = { price: orderDirection };
      } else if (field === 'rating') {
        orderBy = { averageRating: orderDirection };
      } else if (field === 'date') {
        orderBy = { createdAt: orderDirection };
      }
    }

    return this.prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        productPhotos: { orderBy: { order: 'asc' } },
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        productPhotos: { orderBy: { order: 'asc' } },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    if (updateProductDto.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: updateProductDto.categoryId },
      });
      if (!categoryExists) {
        throw new NotFoundException('Category not found.');
      }
    }

    try {
      return await this.prisma.product.update({
        where: { id },
        data: {
          name: updateProductDto.name,
          slug: updateProductDto.slug,
          shortDescription: updateProductDto.shortDescription,
          longDescription: updateProductDto.longDescription,
          price: updateProductDto.price,
          stockQuantity: updateProductDto.stockQuantity,
          categoryId: updateProductDto.categoryId,
        },
      });
    } catch (error) {
      if (isErrorWithCode(error) && error.code === 'P2002') {
        throw new ConflictException('This slug is already in use.');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
