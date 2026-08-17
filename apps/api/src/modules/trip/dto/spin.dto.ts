import { ArrayNotEmpty, IsArray, IsOptional, IsString } from 'class-validator';

export class SpinDto {
  @IsString()
  topic!: string;

  /** 不传就默认全员参与 */
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  participantIds?: string[];
}
