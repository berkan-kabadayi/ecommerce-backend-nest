import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductComment } from 'generated/prisma/browser';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto): Promise<ProductComment> {
    if (!createCommentDto.title && !createCommentDto.content) {
      throw new BadRequestException(
        'At least one of the title or content sections must be filled in.',
      );
    }

    const newComment = await this.prisma.productComment.create({
      data: {
        productId: createCommentDto.productId,
        title: createCommentDto.title!,
        content: createCommentDto.content!,
        rating: createCommentDto.rating,
        userId: '1',
      },
    });

    return newComment;
  }

  async findAll(
    productId?: string,
    rating?: number,
  ): Promise<ProductComment[]> {
    const comments = await this.prisma.productComment.findMany({
      where: {
        productId,
        rating: rating ? Number(rating) : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
    return comments;
  }

  async findOne(id: string): Promise<ProductComment> {
    const comment = await this.prisma.productComment.findUnique({
      where: { id },
    });
    if (!comment) {
      throw new BadRequestException('Comment not found');
    }
    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<ProductComment> {
    const updatedComment = await this.prisma.productComment.update({
      where: { id },
      data: updateCommentDto,
    });
    return updatedComment;
  }

  async remove(id: string): Promise<ProductComment> {
    await this.findOne(id);

    const deletedComment = await this.prisma.productComment.delete({
      where: { id },
    });
    return deletedComment;
  }
}
