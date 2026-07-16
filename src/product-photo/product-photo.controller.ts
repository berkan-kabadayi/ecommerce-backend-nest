import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Query,
  Delete,
} from '@nestjs/common';
import { ProductPhotoService } from './product-photo.service';
import { CreateProductPhotoDto } from './dto/create-product-photo.dto'; // DTO'yu import et
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/auth/constants/permissions.constant';
import { UpdateProductPhotoDto } from './dto/update-product-photo.dto';

@Controller('products/:productId/photos')
export class ProductPhotoController {
  constructor(private readonly photoService: ProductPhotoService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.PRODUCT_PHOTOS.CREATE)
  create(@Body() data: CreateProductPhotoDto) {
    return this.photoService.create(data);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.PRODUCT_PHOTOS.UPDATE)
  update(@Param('id') id: string, @Body() data: UpdateProductPhotoDto) {
    return this.photoService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.PRODUCT_PHOTOS.DELETE)
  remove(@Param('id') id: string) {
    return this.photoService.remove(id);
  }

  @Get()
  findAllByProduct(@Query('productId') productId: string) {
    return this.photoService.findAllByProduct(productId);
  }
}
