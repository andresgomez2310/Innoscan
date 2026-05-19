import { IsString, IsOptional } from 'class-validator';

export class GenerateRecommendationsDto {
  @IsOptional() @IsString() scanId?: string;
  @IsOptional() @IsString() transformationTypeId?: string;
  @IsOptional() @IsString() itemName?: string;
  @IsOptional() @IsString() imageBase64?: string; // <--- VITAL
}