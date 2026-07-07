import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { Request } from 'express'; //

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

@Controller('order')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.create(req.user.id, createOrderDto);
  }

  @Get()
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.orderService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.orderService.findOne(id, req.user.id);
  }
}
