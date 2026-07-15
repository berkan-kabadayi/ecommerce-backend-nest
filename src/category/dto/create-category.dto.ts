import { IsString, IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
