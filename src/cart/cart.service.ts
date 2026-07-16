import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CartItem } from 'generated/prisma/client';

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

  async create(userId: string, dto: CreateCartItemDto): Promise<CartItem> {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product || product.stockQuantity <= 0) {
        throw new BadRequestException('Product is out of stock or not found');
      }

      const existingItem = await tx.cartItem.findFirst({
        where: { userId, productId: dto.productId },
      });

      const newQuantity = (existingItem?.quantity || 0) + dto.quantity;

      if (newQuantity > product.stockQuantity) {
        throw new BadRequestException('Insufficient stock.');
      }

      if (existingItem) {
        return tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });
      }

      return tx.cartItem.create({
        data: {
          quantity: dto.quantity,
          userId,
          productId: dto.productId,
        },
      });
    });
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

    if (updateCartItemDto.quantity > cartItem.product.stockQuantity) {
      throw new BadRequestException(
        `Insufficient stock. Maximum available: ${cartItem.product.stockQuantity}`,
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
