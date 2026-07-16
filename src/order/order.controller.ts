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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/auth/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions.constant';
import { Request } from 'express';
import { UpdateOrderDto } from './dto/update-order.dto';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    username: string;
  };
}

@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.ORDERS.CREATE)
  async create(@Req() req: AuthenticatedRequest) {
    return this.orderService.create(req.user.sub);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.ORDERS.READ_OWN)
  async findAll(@Req() req: AuthenticatedRequest) {
    return this.orderService.findAll(req.user.sub);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.ORDERS.READ_OWN)
  async findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.orderService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.ORDERS.UPDATE_ANY)
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.orderService.update(id, updateOrderDto);
  }
}
