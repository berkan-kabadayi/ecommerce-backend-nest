import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma/client';
import { UpdateOrderDto } from './dto/update-order.dto';

type OrderRecord = Record<string, unknown>;

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureOrderExists(id: string): Promise<void> {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }

  // createOrderDto bağımlılığını kaldırarak temizledik
  async create(userId: string): Promise<OrderRecord> {
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Sepeti Getir
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      if (!cartItems || cartItems.length === 0) {
        throw new BadRequestException('Sipariş oluşturulamaz: Sepetiniz boş.');
      }

      let totalAmount = 0;

      // 2. Stok Kontrolü (PDF-2 Sayfa 4)
      for (const item of cartItems) {
        if (item.product.stockQuantity < item.quantity) {
          throw new BadRequestException(
            `Yetersiz stok: ${item.product.name} ürünü için mevcut stok ${item.product.stockQuantity}, istenen adet ${item.quantity}.`,
          );
        }
        totalAmount += Number(item.product.price) * item.quantity;
      }

      // 3. Siparişi Oluştur (PDF-2 Sayfa 4 Şeması)
      const order = await tx.order.create({
        data: {
          user: { connect: { id: userId } },
          totalPrice: new Prisma.Decimal(totalAmount.toString()),
          status: 'PENDING',
        },
      });

      // 4. Sipariş Kalemlerini Aktar ve Stoğu Düş (PDF-2 Sayfa 4)
      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            order: { connect: { id: order.id } },
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
            unitPrice: item.product.price,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 5. Sepeti Boşalt (PDF-2 Sayfa 3)
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          orderItems: {
            include: { product: true },
          },
        },
      });
    });

    if (!result) {
      throw new BadRequestException('Sipariş oluşturma işlemi başarısız oldu.');
    }

    // Unnecessary assertion uyarısını engellemek için doğrudan dönüyoruz
    return result;
  }

  async findAll(userId: string): Promise<OrderRecord[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }

  async findOne(id: string, userId: string): Promise<OrderRecord> {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with ID ${id} not found for this user`,
      );
    }

    return order;
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderRecord> {
    await this.ensureOrderExists(id);

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: updateOrderDto.status,
      },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });

    return updatedOrder;
  }
}
