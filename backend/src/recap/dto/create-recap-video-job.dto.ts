import { IsBoolean, IsIn } from 'class-validator';
import { SUPPORTED_LANGUAGE_CODES } from '../tts-languages';

export class CreateRecapVideoJobDto {
  @IsBoolean()
  includeCaptions: boolean;

  @IsIn(SUPPORTED_LANGUAGE_CODES)
  language: string;
}
