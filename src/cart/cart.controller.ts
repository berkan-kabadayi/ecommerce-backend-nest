import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';

import { AuthGuard, AuthRequest } from '../auth/guards/auth/auth.guard';
@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async create(
    @Req() req: AuthRequest,
    @Body() createCartItemDto: CreateCartItemDto,
  ) {
    const userId = req.user!.sub;
    const newCartItem = await this.cartService.create(
      userId,
      createCartItemDto,
    );
    return newCartItem;
  }

  @Get()
  async findAll(@Req() req: AuthRequest) {
    const userId = req.user!.sub;
    const cartItems = await this.cartService.findAll(userId);
    return cartItems;
  }

  @Delete('clear')
  async removeAll(@Req() req: AuthRequest) {
    const userId = req.user!.sub;
    const result = await this.cartService.removeAll(userId);
    return result;
  }

  @Patch(':id')
  async update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    const userId = req.user!.sub;
    const updatedCartItem = await this.cartService.update(
      userId,
      id,
      updateCartItemDto,
    );
    return updatedCartItem;
  }

  @Delete(':id')
  async remove(@Req() req: AuthRequest, @Param('id') id: string) {
    const userId = req.user!.sub;
    const deletedCartItem = await this.cartService.remove(userId, id);
    return deletedCartItem;
  }
}
