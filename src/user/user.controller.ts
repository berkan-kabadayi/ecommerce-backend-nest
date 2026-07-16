import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '.././auth/guards/auth/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions.constant';
import { UpdateUserDto } from './dto/update-user.dto';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    username: string;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Req() req: AuthenticatedRequest) {
    return this.userService.findById(req.user.sub);
  }

  @Get('all')
  @RequirePermissions(PERMISSIONS.USERS.READ_CONFIDENTIAL)
  getAllUsersConfidential() {
    return {
      message: 'Only administrators have access to this confidential data!',
    };
  }

  @Get()
  @RequirePermissions(PERMISSIONS.USERS.READ)
  getAllUsers() {
    return this.userService.findAll();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.USERS.READ)
  getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.USERS.UPDATE)
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }
}
