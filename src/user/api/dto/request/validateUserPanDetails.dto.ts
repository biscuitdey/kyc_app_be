import { IsNotEmpty } from 'class-validator';

export class ValidateUserPanDetailsDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  panNumber: string;
}
