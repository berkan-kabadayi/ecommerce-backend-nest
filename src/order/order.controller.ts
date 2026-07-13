import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { Request } from 'express'; //
import { UpdateOrderDto } from './dto/update-order.dto';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    username: string;
  };
}

@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.create(req.user.sub, createOrderDto);
  }

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.orderService.findAll(req.user.sub);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.orderService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    console.log(
      `[Order Update] ${id} nolu sipariş ${req.user.sub} tarafından güncelleniyor.`,
    );
    return this.orderService.update(id, updateOrderDto);
  }
}
