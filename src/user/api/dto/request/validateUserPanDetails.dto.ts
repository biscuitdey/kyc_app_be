import { IsNotEmpty, Length, MaxLength, MinLength } from 'class-validator';

export class ValidateUserPanDetailsDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(10)
  panNumber: string;
}
