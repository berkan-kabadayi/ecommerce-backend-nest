export class CreateProductPhotoDto {
  url!: string;
  size!: number;
  isPrimary?: boolean;
  order?: number;
}
