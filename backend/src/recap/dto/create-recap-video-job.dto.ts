import { IsBoolean, IsIn, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { SUPPORTED_LANGUAGE_CODES } from '../tts-languages';

export class CreateRecapVideoJobDto {
  @IsBoolean()
  includeCaptions: boolean;

  @IsIn(SUPPORTED_LANGUAGE_CODES)
  language: string;

  @IsOptional()
  @IsNumber()
  @Min(-50)
  @Max(50)
  pitch?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(2)
  rate?: number;
}
