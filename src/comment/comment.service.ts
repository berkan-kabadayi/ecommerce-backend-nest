import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductComment, Prisma } from 'generated/prisma/client';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  private async updateProductStats(
    tx: Prisma.TransactionClient,
    productId: string,
  ) {
    const aggregations = await tx.productComment.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await tx.product.update({
      where: { id: productId },
      data: {
        commentCount: aggregations._count.id || 0,
        averageRating: aggregations._avg.rating || 0,
      },
    });
  }

  async create(userId: string, dto: CreateCommentDto): Promise<ProductComment> {
    if (!dto.title && dto.content) {
      throw new BadRequestException(
        'If the content has been filled in, the title section cannot be left blank.',
      );
    }

    const titleToSave = dto.title ? dto.title : null;

    const contentToSave = titleToSave && dto.content ? dto.content : null;

    return this.prisma.$transaction(async (tx) => {
      const newComment = await tx.productComment.create({
        data: {
          productId: dto.productId,
          userId: userId,
          title: titleToSave,
          content: contentToSave,
          rating: dto.rating,
        },
      });

      await this.updateProductStats(tx, dto.productId);

      return newComment;
    });
  }

  async findAll(
    productId?: string,
    rating?: number,
  ): Promise<ProductComment[]> {
    return this.prisma.productComment.findMany({
      where: {
        productId,
        rating: rating ? Number(rating) : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<ProductComment> {
    const comment = await this.prisma.productComment.findUnique({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException('No comments found.');
    }
    return comment;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateCommentDto,
  ): Promise<ProductComment> {
    const comment = await this.findOne(id);

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only update your own comment.');
    }

    let titleToUpdate = comment.title;
    let contentToUpdate = comment.content;

    if (dto.title !== undefined || dto.content !== undefined) {
      const checkTitle = dto.title !== undefined ? dto.title : comment.title;
      const checkContent =
        dto.content !== undefined ? dto.content : comment.content;

      if (!checkTitle && checkContent) {
        throw new BadRequestException(
          'If the content has been filled in, the title section cannot be left blank.',
        );
      }

      titleToUpdate = checkTitle ? checkTitle : null;
      contentToUpdate = titleToUpdate && checkContent ? checkContent : null;
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedComment = await tx.productComment.update({
        where: { id },
        data: {
          ...dto,
          title: titleToUpdate,
          content: contentToUpdate,
        },
      });

      await this.updateProductStats(tx, comment.productId);

      return updatedComment;
    });
  }

  async remove(id: string, userId: string): Promise<ProductComment> {
    const comment = await this.findOne(id);

    if (comment.userId !== userId) {
      throw new ForbiddenException('You can only delete your own comment.');
    }

    return this.prisma.$transaction(async (tx) => {
      const deletedComment = await tx.productComment.delete({
        where: { id },
      });

      await this.updateProductStats(tx, comment.productId);

      return deletedComment;
    });
  }
}
