import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductPhotoDto } from './dto/create-product-photo.dto';
import { UpdateProductPhotoDto } from './dto/update-product-photo.dto';

@Injectable()
export class ProductPhotoService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductPhotoDto) {
    const { productId, url, size, isPrimary } = dto;

    return this.prisma.$transaction(async (tx) => {
      const productExists = await tx.product.findUnique({
        where: { id: productId },
      });
      if (!productExists) {
        throw new NotFoundException('The specified product was not found.');
      }

      const existingPhotos = await tx.productPhoto.findMany({
        where: { productId },
        orderBy: { order: 'asc' },
      });

      const nextOrder = existingPhotos.length + 1;

      const isPhotoPrimary = existingPhotos.length === 0 ? true : !!isPrimary;

      if (isPhotoPrimary) {
        await tx.productPhoto.updateMany({
          where: { productId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      const newPhoto = await tx.productPhoto.create({
        data: {
          productId,
          url,
          size,
          isPrimary: isPhotoPrimary,
          order: nextOrder,
        },
      });

      if (isPhotoPrimary) {
        await tx.product.update({
          where: { id: productId },
          data: { primaryPhotoUrl: url },
        });
      }

      return newPhoto;
    });
  }

  async update(photoId: string, dto: UpdateProductPhotoDto) {
    const { order: newOrder, isPrimary: nextIsPrimary } = dto;

    return this.prisma.$transaction(async (tx) => {
      const targetPhoto = await tx.productPhoto.findUnique({
        where: { id: photoId },
      });
      if (!targetPhoto) {
        throw new NotFoundException('No photo found.');
      }

      const { productId, order: oldOrder, isPrimary: wasPrimary } = targetPhoto;

      if (nextIsPrimary !== undefined) {
        if (nextIsPrimary === true && !wasPrimary) {
          await tx.productPhoto.updateMany({
            where: { productId, isPrimary: true },
            data: { isPrimary: false },
          });

          await tx.productPhoto.update({
            where: { id: photoId },
            data: { isPrimary: true },
          });

          await tx.product.update({
            where: { id: productId },
            data: { primaryPhotoUrl: targetPhoto.url },
          });
        } else if (nextIsPrimary === false && wasPrimary) {
          throw new BadRequestException(
            'At least one photo must be the primary photo. To change the primary photo, please make another photo the primary one.',
          );
        }
      }

      if (newOrder !== undefined && newOrder !== oldOrder) {
        const allPhotos = await tx.productPhoto.findMany({
          where: { productId },
          orderBy: { order: 'asc' },
        });

        if (newOrder < 1 || newOrder > allPhotos.length) {
          throw new BadRequestException(
            `The sequence number must be between 1 and ${allPhotos.length}.`,
          );
        }

        const otherPhotos = allPhotos.filter((p) => p.id !== photoId);
        const targetIndex = newOrder - 1;
        otherPhotos.splice(targetIndex, 0, targetPhoto);

        for (let i = 0; i < otherPhotos.length; i++) {
          await tx.productPhoto.update({
            where: { id: otherPhotos[i].id },
            data: { order: -(i + 1) },
          });
        }

        for (let i = 0; i < otherPhotos.length; i++) {
          await tx.productPhoto.update({
            where: { id: otherPhotos[i].id },
            data: { order: i + 1 },
          });
        }
      }

      return tx.productPhoto.findUnique({
        where: { id: photoId },
      });
    });
  }

  async remove(photoId: string) {
    return this.prisma.$transaction(async (tx) => {
      const targetPhoto = await tx.productPhoto.findUnique({
        where: { id: photoId },
      });
      if (!targetPhoto) {
        throw new NotFoundException('No photo found.');
      }

      const { productId, isPrimary: wasPrimary } = targetPhoto;

      await tx.productPhoto.delete({
        where: { id: photoId },
      });

      const remainingPhotos = await tx.productPhoto.findMany({
        where: { productId },
        orderBy: { order: 'asc' },
      });

      for (let i = 0; i < remainingPhotos.length; i++) {
        await tx.productPhoto.update({
          where: { id: remainingPhotos[i].id },
          data: { order: -(i + 1) },
        });
      }

      for (let i = 0; i < remainingPhotos.length; i++) {
        await tx.productPhoto.update({
          where: { id: remainingPhotos[i].id },
          data: { order: i + 1 },
        });
      }

      if (wasPrimary) {
        if (remainingPhotos.length > 0) {
          const newPrimaryPhotoId = remainingPhotos[0].id;
          const updatedPrimaryPhoto = await tx.productPhoto.update({
            where: { id: newPrimaryPhotoId },
            data: { isPrimary: true },
          });

          await tx.product.update({
            where: { id: productId },
            data: { primaryPhotoUrl: updatedPrimaryPhoto.url },
          });
        } else {
          await tx.product.update({
            where: { id: productId },
            data: { primaryPhotoUrl: null },
          });
        }
      }

      return targetPhoto;
    });
  }

  async findAllByProduct(productId: string) {
    return this.prisma.productPhoto.findMany({
      where: { productId },
      orderBy: { order: 'asc' },
    });
  }
}
