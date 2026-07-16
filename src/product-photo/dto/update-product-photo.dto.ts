import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateProductPhotoDto {
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}
