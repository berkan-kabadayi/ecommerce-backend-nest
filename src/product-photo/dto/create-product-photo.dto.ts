import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateProductPhotoDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsNumber()
  @IsNotEmpty()
  size!: number;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}
