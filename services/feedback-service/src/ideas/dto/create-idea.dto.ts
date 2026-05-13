import { IsString, IsOptional, MinLength, MaxLength, IsUUID, IsIn } from 'class-validator';

export class CreateIdeaDto {
  @IsString() @MinLength(3) @MaxLength(200) titulo: string;
  @IsString() @MinLength(5) descripcion: string;
  @IsOptional() @IsUUID() producto_id?: string;
  @IsOptional() @IsString() categoria?: string;
  @IsOptional() @IsString() @IsIn(['activa','en_progreso','completada','descartada']) estado?: string;
}