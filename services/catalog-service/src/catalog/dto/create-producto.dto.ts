import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateProductoDto {
  @IsString() @MinLength(2) @MaxLength(120) nombre: string;
  @IsOptional() @IsString() categoria?: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsString() codigo_barras?: string;
}