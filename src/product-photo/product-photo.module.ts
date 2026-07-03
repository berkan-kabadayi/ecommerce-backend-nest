import { Module } from '@nestjs/common';
import { ProductPhotoService } from './product-photo.service';
import { ProductPhotoController } from './product-photo.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [ProductPhotoService, PrismaService],
  controllers: [ProductPhotoController],
})
export class ProductPhotoModule {}
