import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';

type ProductRecord = Record<string, unknown>;

interface PrismaProductClient {
  create(args: Prisma.ProductCreateArgs): Promise<ProductRecord>;
  findMany(args?: Prisma.ProductFindManyArgs): Promise<ProductRecord[]>;
  update(args: Prisma.ProductUpdateArgs): Promise<ProductRecord>;
  findUnique(args: Prisma.ProductFindUniqueArgs): Promise<ProductRecord | null>;
  delete(args: Prisma.ProductDeleteArgs): Promise<ProductRecord>;
}

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  private get productClient(): PrismaProductClient {
    return (this.prisma as unknown as { product: PrismaProductClient }).product;
  }

  async create(createProductDto: CreateProductDto): Promise<ProductRecord> {
    return this.productClient.create({
      data: createProductDto,
    });
  }

  findAll(): Promise<ProductRecord[]> {
    return this.productClient.findMany();
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductRecord> {
    return this.productClient.update({
      where: { id },
      data: updateProductDto,
    });
  }
  async findOne(id: string): Promise<ProductRecord | null> {
    return this.productClient.findUnique({
      where: { id },
    });
  }

  async remove(id: string): Promise<ProductRecord> {
    return this.productClient.delete({
      where: { id },
    });
  }
}
