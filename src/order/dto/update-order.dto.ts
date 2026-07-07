import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from 'generated/prisma/enums';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsNotEmpty({ message: 'Order status cannot be left blank.' })
  @IsEnum(OrderStatus as Record<string, string>, {
    message:
      'Invalid order status. Possible values: PENDING, PAID, SHIPPED, DELIVERED, CANCELLED',
  })
  status!: OrderStatus;
}
