import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartItem, Prisma } from 'generated/prisma/client';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureCartItemExists(
    id: string,
    userId: string,
  ): Promise<void> {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id, userId },
    });
    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${id} not found`);
    }
  }

  async create(
    userId: string,
    createCartItemDto: CreateCartItemDto,
  ): Promise<CartItem> {
    const product = await this.prisma.product.findUnique({
      where: { id: createCartItemDto.productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID ${createCartItemDto.productId} not found`,
      );
    }

    if (product.stock <= 0) {
      throw new BadRequestException('Product is out of stock');
    }

    const existingCartItem = await this.prisma.cartItem.findFirst({
      where: { userId, productId: createCartItemDto.productId },
    });

    if (existingCartItem) {
      const newQuantity =
        existingCartItem.quantity + createCartItemDto.quantity;

      if (newQuantity > product.stock) {
        throw new BadRequestException(
          `Insufficient stock. Maximum available: ${product.stock}`,
        );
      }

      const updateData = {
        quantity: newQuantity,
      };

      const updatedCartItem = await this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: updateData,
      });

      return updatedCartItem;
    }

    if (createCartItemDto.quantity > product.stock) {
      throw new BadRequestException(
        `Insufficient stock. Maximum available: ${product.stock}`,
      );
    }

    const cartItemData: Prisma.CartItemCreateInput = {
      quantity: createCartItemDto.quantity,
      user: { connect: { id: userId } },
      product: { connect: { id: createCartItemDto.productId } },
    };

    const newCartItem = await this.prisma.cartItem.create({
      data: cartItemData,
    });
    return newCartItem;
  }

  async findAll(userId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });
    return cartItems;
  }

  async update(
    userId: string,
    id: string,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    await this.ensureCartItemExists(id, userId);

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${id} not found`);
    }

    if (updateCartItemDto.quantity > cartItem.product.stock) {
      throw new BadRequestException(
        `Insufficient stock. Maximum available: ${cartItem.product.stock}`,
      );
    }

    const updateData = {
      quantity: updateCartItemDto.quantity,
    };

    const updatedItem = await this.prisma.cartItem.update({
      where: { id },
      data: updateData,
    });

    return updatedItem;
  }

  async remove(userId: string, id: string) {
    await this.ensureCartItemExists(id, userId);

    const deletedItem = await this.prisma.cartItem.delete({
      where: { id },
    });
    return deletedItem;
  }

  async removeAll(userId: string) {
    const deleteResult = await this.prisma.cartItem.deleteMany({
      where: { userId },
    });
    return deleteResult;
  }
}
