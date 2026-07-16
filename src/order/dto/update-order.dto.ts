import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from 'generated/prisma/enums';

export class UpdateOrderDto {
  @IsNotEmpty({ message: 'Order status cannot be left blank.' })
  @IsEnum(OrderStatus, {
    message:
      'Invalid order status. Possible values: PENDING, PAID, SHIPPED, DELIVERED, CANCELLED',
  })
  status!: OrderStatus;
}
