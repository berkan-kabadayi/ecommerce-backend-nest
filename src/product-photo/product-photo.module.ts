import { Module } from '@nestjs/common';
import { ProductPhotoService } from './product-photo.service';
import { ProductPhotoController } from './product-photo.controller';

@Module({
  providers: [ProductPhotoService],
  controllers: [ProductPhotoController]
})
export class ProductPhotoModule {}
