import { IsString, MaxLength, MinLength } from 'class-validator';

export class OperationalSearchDto {
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  query: string;
}
