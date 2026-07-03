import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    const newComment = await this.commentService.create(createCommentDto);
    return newComment;
  }

  @Get()
  async findAll(
    @Query('productId') productId?: string,
    @Query('rating') rating?: number,
  ) {
    const comment = await this.commentService.findAll(productId, rating);
    return comment;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const comment = await this.commentService.findOne(id);
    return comment;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const updatedComment = await this.commentService.update(
      id,
      updateCommentDto,
    );
    return updatedComment;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedComment = await this.commentService.remove(id);
    return deletedComment;
  }
}
