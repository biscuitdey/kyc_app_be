import { APIService } from '../../../../utilities/apiCall.service';
import 'dotenv/config';

export class Razorpay {
  clientCredentials = {};
  constructor(private readonly apiAgent: APIService) {
    this.clientCredentials = {
      id: process.env.RAZORPAY_CLIENT_ID,
      secret: process.env.RAZORPAY_CLIENT_SECRET,
    };
  }

  async createAccount(name: string) {
    try {
      const url = 'https://api.razorpay.com/v1/contacts';
      const requestParams = JSON.stringify({
        name: name,
      });
      const account = await this.apiAgent.post(
        url,
        'Basic',
        requestParams,
        null,
        this.clientCredentials,
      );

      return account;
    } catch (e) {
      console.log(e.response.data.error);
    }
  }

  async createFundAccount(
    account: any,
    ifsc: string,
    bankAccountNumber: string,
  ) {
    try {
      const url = 'https://api.razorpay.com/v1/fund_accounts';
      const requestParams = JSON.stringify({
        contact_id: account.id,
        account_type: 'bank_account',
        bank_account: {
          name: account.name,
          ifsc: ifsc,
          account_number: bankAccountNumber,
        },
      });
      const fund = await this.apiAgent.post(
        url,
        'Basic',
        requestParams,
        null,
        this.clientCredentials,
      );
      return fund;
    } catch (e) {
      console.log(e.response.data.error);
    }
  }

  async validateAccount(fundId: string) {
    try {
      const url = 'https://api.razorpay.com/v1/fund_accounts/validations';
      const requestParams = JSON.stringify({
        account_number: '2323230062425530',
        fund_account: {
          id: fundId,
        },
        amount: 100,
      });
      const response = await this.apiAgent.post(
        url,
        'Basic',
        requestParams,
        null,
        this.clientCredentials,
      );
      return response;
    } catch (e) {
      console.log(e.response.data.error);
    }
  }

  async validateBankDetails(
    name: string,
    ifsc: string,
    bankAccountNumber: string,
  ): Promise<string> {
    const account = await this.createAccount(name);
    const fund = await this.createFundAccount(account, ifsc, bankAccountNumber);
    const accountValidationResponse = await this.validateAccount(fund.id);
    if (accountValidationResponse.status === 'created') {
      return 'Awaiting validation from bank';
    } else if (accountValidationResponse.status === 'completed') {
      return await this.verifyCompletedBankValidation(
        accountValidationResponse,
      );
    } else {
      return 'Unverified account';
    }
  }

  async verifyCompletedBankValidation(validatedAccount: any): Promise<string> {
    if (
      validatedAccount.results['account_status'] === 'active' ||
      validatedAccount['fund_account']['bank_account']['name'] ===
        validatedAccount.results['registered_name']
    ) {
      return 'Bank details verified';
    } else if (validatedAccount.results['account_status'] != 'active') {
      return 'Bank account is either invalid or inactive.';
    } else {
      return 'Beneficiary does not match the account created';
    }
  }
}
