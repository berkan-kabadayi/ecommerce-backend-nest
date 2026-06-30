import { IsString, IsNumber, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  stock: number;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
