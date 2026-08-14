import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAiModelConfigDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  label?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  modelId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  apiKey?: string;
}
