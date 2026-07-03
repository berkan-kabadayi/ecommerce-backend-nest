import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  productId!: string;

  @IsString()
  @IsOptional()
  title?: string = '';

  @IsString()
  @IsOptional()
  content?: string = '';

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  rating!: number;
}
