import { Injectable } from '@nestjs/common';
import { Razorpay } from './validationAPIServices/razorpay/razorpay';

@Injectable()
export class BankAccountValidationService {
  constructor(private readonly validationService: Razorpay) {}

  public async validateBankDetails(
    beneficiaryName: string,
    ifsc: string,
    accountNumber: string,
  ): Promise<string> {
    return await this.validationService.validateBankDetails(
      beneficiaryName,
      ifsc,
      accountNumber,
    );
  }

  public async verifyValidatedBankDetails(
    validatedAccount: object,
  ): Promise<string> {
    return await this.validationService.verifyCompletedBankValidation(
      validatedAccount,
    );
  }
}
