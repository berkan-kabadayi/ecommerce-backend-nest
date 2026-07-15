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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    username: string;
    role: 'ADMIN' | 'USER';
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Req() req: AuthenticatedRequest) {
    return this.userService.findById(req.user.sub);
  }

  @Get('all')
  @Roles('ADMIN')
  getAllUsersConfidential() {
    return {
      message: 'Only administrators have access to this confidential data!',
    };
  }

  @Get()
  getAllUsers() {
    return this.userService.findAll();
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }
}
