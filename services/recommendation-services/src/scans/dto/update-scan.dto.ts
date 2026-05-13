import { IsString, IsOptional, IsArray, MaxLength, IsIn } from 'class-validator';

export class UpdateScanDto {
  @IsOptional() @IsString() @MaxLength(120) itemName?: string;
  @IsOptional() @IsString() @IsIn(['nuevo','bueno','regular','dañado','antiguo','raro']) condition?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}