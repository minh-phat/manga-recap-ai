import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRecapScriptEntryDto {
  @IsString()
  @IsNotEmpty()
  narrationText: string;
}
