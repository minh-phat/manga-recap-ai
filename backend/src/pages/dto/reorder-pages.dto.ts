import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class ReorderPagesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  pageIds: string[];
}
