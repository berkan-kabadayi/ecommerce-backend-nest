import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateCartItemDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity!: number;
}
