import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number) // Gelen veriyi otomatik olarak number tipine dönüştürür
  price!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number) // Gelen veriyi otomatik olarak number tipine dönüştürür
  stock!: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
