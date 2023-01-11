import { IsNotEmpty } from 'class-validator';

export class ValidateUserBankDetailsDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  beneficiaryName: string;

  @IsNotEmpty()
  ifsc: string;

  @IsNotEmpty()
  accountNumber: string;
}
