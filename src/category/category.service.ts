import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

type CategoryRecord = Record<string, unknown>;

interface PrismaCategoryClient {
  create(args: { data: CreateCategoryDto }): Promise<CategoryRecord>;
  findMany(args?: {
    orderBy?: { order: 'asc' | 'desc' };
  }): Promise<CategoryRecord[]>;
  findUnique(args: { where: { id: string } }): Promise<CategoryRecord | null>;
  update(args: {
    where: { id: string };
    data: UpdateCategoryDto;
  }): Promise<CategoryRecord>;
  delete(args: { where: { id: string } }): Promise<CategoryRecord>;
}

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  private get categoryClient(): PrismaCategoryClient {
    return (this.prisma as unknown as { category: PrismaCategoryClient })
      .category;
  }

  async create(dto: CreateCategoryDto): Promise<CategoryRecord> {
    return this.categoryClient.create({ data: dto });
  }

  async findAll(): Promise<CategoryRecord[]> {
    return this.categoryClient.findMany({ orderBy: { order: 'asc' } });
  }

  async findOne(id: string): Promise<CategoryRecord | null> {
    return this.categoryClient.findUnique({ where: { id } });
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryRecord> {
    return this.categoryClient.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<CategoryRecord> {
    return this.categoryClient.delete({ where: { id } });
  }
}
