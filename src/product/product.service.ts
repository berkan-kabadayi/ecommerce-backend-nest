import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Product } from 'generated/prisma/client';

interface PrismaProductClient {
  create(args: Prisma.ProductCreateArgs): Promise<Product>;
  findMany(args?: Prisma.ProductFindManyArgs): Promise<Product[]>;
}

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  private get productClient(): PrismaProductClient {
    return (this.prisma as unknown as { product: PrismaProductClient }).product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.productClient.create({
      data: createProductDto,
    });
  }

  findAll(): Promise<Product[]> {
    return this.productClient.findMany();
  }
}
