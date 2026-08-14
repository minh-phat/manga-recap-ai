import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class CreateRecapJobDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  pageIds: string[];
}
