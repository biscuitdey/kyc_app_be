import { Injectable } from '@nestjs/common';
import { User } from '../models/user';
import { UserStorageAgent } from './userStorage.agent';
import { BankAccountValidationService } from '../services/bankAccountDetailsValidation/bankAccountValidation.service';
import { PanValidationService } from '../services/panDetailsValidation/panValidation.service';
import { v4 as uuidv4 } from 'uuid';
import { PanValidationStatus } from '../models/panValidationStatus';

@Injectable()
export class UserAgent {
  constructor(
    private readonly storageAgent: UserStorageAgent,
    private readonly bankAccountValidationService: BankAccountValidationService,
    private readonly panValidationService: PanValidationService,
  ) {}

  //create a new user
  public createUser(name: string): User {
    return new User(uuidv4(), name);
  }
  //validate bank details
  public async validateBankAccountDetails(
    beneficiaryName: string,
    ifsc: string,
    accountNumber: string,
  ): Promise<string> {
    return await this.bankAccountValidationService.validateBankDetails(
      beneficiaryName,
      ifsc,
      accountNumber,
    );
  }

  public async verifyValidatedBankAccountDetails(
    validatedAccount: object,
  ): Promise<string> {
    return await this.bankAccountValidationService.verifyValidatedBankDetails(
      validatedAccount,
    );
  }

  public async validatePanDetails(
    panNumber: string,
  ): Promise<PanValidationStatus> {
    return await this.panValidationService.validatePAN(panNumber);
  }

  //Validate credit details

  //Validate personal details
  public async throwIfInvalidCreateUserInputData() {
    return true;
  }

  public async fetchUpdateCandidateAndThrowErrorIfValidationFails() {
    return true;
  }

  public async fetchDeleteCandidateAndThrowErrorIfValidationFails() {
    return true;
  }
}
