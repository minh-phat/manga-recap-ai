import { IsBoolean } from 'class-validator';

export class CreateRecapVideoJobDto {
  @IsBoolean()
  includeCaptions: boolean;
}
