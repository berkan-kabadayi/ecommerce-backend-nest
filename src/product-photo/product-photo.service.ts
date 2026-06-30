import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type ProductPhotoRecord = Record<string, unknown>;

interface CreateProductPhotoData {
  url: string;
  size: number;
  isPrimary?: boolean;
  order?: number;
}

interface PrismaProductPhotoClient {
  create(args: {
    data: CreateProductPhotoData & { productId: string };
  }): Promise<ProductPhotoRecord>;
  updateMany(args: {
    where: { productId: string; isPrimary: boolean };
    data: { isPrimary: boolean };
  }): Promise<{ count: number }>;
  findMany(args: {
    where: { productId: string };
    orderBy: { order: 'asc' | 'desc' };
  }): Promise<ProductPhotoRecord[]>;
  update(args: {
    where: { id: string };
    data: Partial<CreateProductPhotoData & { isPrimary: boolean }>;
  }): Promise<ProductPhotoRecord>;
  delete(args: { where: { id: string } }): Promise<ProductPhotoRecord>;
}

interface ProductPhotoDb {
  productPhoto: PrismaProductPhotoClient;
}

@Injectable()
export class ProductPhotoService {
  constructor(private prisma: PrismaService) {}

  private getClient(tx: ProductPhotoDb): PrismaProductPhotoClient {
    return tx.productPhoto;
  }

  async create(
    productId: string,
    data: CreateProductPhotoData,
  ): Promise<ProductPhotoRecord> {
    return this.prisma.$transaction(async (tx) => {
      const client = this.getClient(tx);
      if (data.isPrimary) {
        await client.updateMany({
          where: { productId, isPrimary: true },
          data: { isPrimary: false },
        });
      }
      return client.create({ data: { ...data, productId } });
    });
  }

  async findAllByProduct(productId: string): Promise<ProductPhotoRecord[]> {
    return this.getClient(this.prisma).findMany({
      where: { productId },
      orderBy: { order: 'asc' },
    });
  }

  async update(
    photoId: string,
    productId: string,
    data: Partial<CreateProductPhotoData>,
  ): Promise<ProductPhotoRecord> {
    return await this.prisma.$transaction(async (tx) => {
      const client = this.getClient(tx);

      if (data.isPrimary === true) {
        await client.updateMany({
          where: { productId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      return await client.update({
        where: { id: photoId },
        data,
      });
    });
  }

  async remove(photoId: string): Promise<ProductPhotoRecord> {
    return await this.prisma.$transaction(async (tx) => {
      const client = this.getClient(tx);
      return await client.delete({
        where: { id: photoId },
      });
    });
  }
}
