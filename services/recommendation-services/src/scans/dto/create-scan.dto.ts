import { IsString, IsUUID, IsOptional, IsArray, MinLength, MaxLength, IsIn } from 'class-validator';

export class CreateScanDto {
  @IsString() @MinLength(2) @MaxLength(120) itemName: string;
  @IsUUID() categoryId: string;
  @IsString() condition: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}