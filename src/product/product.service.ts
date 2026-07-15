import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Product } from 'generated/prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  private async ensureProductExists(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    if (createProductDto.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: createProductDto.categoryId },
      });
      if (!categoryExists)
        throw new NotFoundException('Category does not exist');
    }

    const productData: Prisma.ProductCreateInput = {
      name: createProductDto.name,
      shortDescription: createProductDto.shortDescription,
      longDescription: createProductDto.longDescription,
      price: new Prisma.Decimal(createProductDto.price),
      stockQuantity: createProductDto.stockQuantity,
      category: createProductDto.categoryId
        ? { connect: { id: createProductDto.categoryId } }
        : undefined,
      slug: createProductDto.slug,
    };

    return this.prisma.product.create({ data: productData });
  }

  findAll(): Promise<Product[]> {
    return this.prisma.product.findMany({
      include: {
        category: true,
        productPhotos: { orderBy: { order: 'asc' } },
      },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        productPhotos: { orderBy: { order: 'asc' } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    await this.ensureProductExists(id);

    const updateData: Prisma.ProductUpdateInput = {
      name: updateProductDto.name,
      shortDescription: updateProductDto.shortDescription,
      longDescription: updateProductDto.longDescription,
      price: updateProductDto.price
        ? new Prisma.Decimal(updateProductDto.price.toString())
        : undefined,
      stockQuantity: updateProductDto.stockQuantity,
      category: updateProductDto.categoryId
        ? { connect: { id: updateProductDto.categoryId } }
        : undefined,
    };

    return this.prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string): Promise<Product> {
    await this.ensureProductExists(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
