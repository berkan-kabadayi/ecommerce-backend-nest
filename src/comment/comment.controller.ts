import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/auth/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/constants/permissions.constant';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    username: string;
  };
}

@Controller('comments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.COMMENTS.CREATE)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.create(req.user.sub, createCommentDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.COMMENTS.READ)
  async findAll(
    @Query('product_id') productId?: string,
    @Query('rating') rating?: number,
  ) {
    return this.commentService.findAll(productId, rating);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.COMMENTS.READ)
  async findOne(@Param('id') id: string) {
    return this.commentService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.COMMENTS.UPDATE_OWN)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(id, req.user.sub, updateCommentDto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.COMMENTS.DELETE_OWN)
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.commentService.remove(id, req.user.sub);
  }
}
