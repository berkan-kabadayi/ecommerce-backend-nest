import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';

type ProductRecord = Record<string, unknown>;

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  private async ensureProductExists(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async create(createProductDto: CreateProductDto): Promise<ProductRecord> {
    if (createProductDto.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: createProductDto.categoryId },
      });
      if (!categoryExists)
        throw new NotFoundException('Category does not exist');
    }

    const productData: Prisma.ProductCreateInput = {
      name: createProductDto.name,
      description: createProductDto.description,

      price: new Prisma.Decimal(createProductDto.price),

      stock: createProductDto.stock,
      category: createProductDto.categoryId
        ? { connect: { id: createProductDto.categoryId } }
        : undefined,
    };

    return this.prisma.product.create({ data: productData });
  }

  findAll(): Promise<ProductRecord[]> {
    return this.prisma.product.findMany({
      include: {
        category: true,
        productPhotos: { orderBy: { order: 'asc' } },
      },
    });
  }

  async findOne(id: string): Promise<ProductRecord> {
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
  ): Promise<ProductRecord> {
    await this.ensureProductExists(id);

    const updateData: Prisma.ProductUpdateInput = {
      name: updateProductDto.name,
      description: updateProductDto.description,

      price: updateProductDto.price
        ? new Prisma.Decimal(updateProductDto.price.toString())
        : undefined,
      stock: updateProductDto.stock,
      category: updateProductDto.categoryId
        ? { connect: { id: updateProductDto.categoryId } }
        : undefined,
    };

    return this.prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string): Promise<ProductRecord> {
    await this.ensureProductExists(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
