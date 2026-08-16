import { ArrayMinSize, IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { SUPPORTED_LANGUAGE_CODES } from '../tts-languages';

export class CreateRecapJobDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  pageIds: string[];

  @IsOptional()
  @IsIn(SUPPORTED_LANGUAGE_CODES)
  language?: string;
}
