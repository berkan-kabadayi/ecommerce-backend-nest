import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ProductPhotoService } from './product-photo.service';
import { CreateProductPhotoDto } from './dto/create-product-photo.dto'; // DTO'yu import et

@Controller('products/:productId/photos')
export class ProductPhotoController {
  constructor(private readonly photoService: ProductPhotoService) {}

  @Post()
  create(
    @Param('productId') productId: string,
    @Body() data: CreateProductPhotoDto,
  ) {
    return this.photoService.create(productId, data);
  }

  @Get()
  findAll(@Param('productId') productId: string) {
    return this.photoService.findAllByProduct(productId);
  }
}
