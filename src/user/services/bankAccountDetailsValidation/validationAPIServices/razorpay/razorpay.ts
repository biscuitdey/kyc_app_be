import { APIService } from '../../../../utilities/apiCall.service';
import 'dotenv/config';
import axios from 'axios';

export class Razorpay {
  authToken: string;
  constructor(private readonly apiAgent: APIService) {
    this.authToken = Buffer.from(
      `${process.env.RAZORPAY_CLIENT_ID}:${process.env.RAZORPAY_CLIENT_SECRET}`,
    ).toString('base64');
  }

  async createAccount(name: string) {
    try {
      const url = 'https://api.razorpay.com/v1/contacts';
      const data = JSON.stringify({
        name: name,
      });

      const params = {
        method: 'POST',
        url: url,
        data: data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.authToken}`,
        },
      };

      const response = await axios(params);
      const account = response.data;
      return account;
    } catch (e) {
      console.log(e);
    }
  }

  async createFundAccount(
    account: any,
    ifsc: string,
    bankAccountNumber: string,
  ) {
    try {
      const url = 'https://api.razorpay.com/v1/fund_accounts';

      const data = JSON.stringify({
        contact_id: account.id,
        account_type: 'bank_account',
        bank_account: {
          name: account.name,
          ifsc: ifsc,
          account_number: bankAccountNumber,
        },
      });

      const params = {
        method: 'POST',
        url: url,
        data: data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.authToken}`,
        },
      };

      const response = await axios(params);
      const fund = response.data;
      return fund;
    } catch (e) {
      console.log(e.response.data.error);
    }
  }

  async validateAccount(fundId: string) {
    try {
      const url = 'https://api.razorpay.com/v1/fund_accounts/validations';
      const data = JSON.stringify({
        account_number: '2323230062425530',
        fund_account: {
          id: fundId,
        },
        amount: 100,
      });
      const params = {
        method: 'POST',
        url: url,
        data: data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${this.authToken}`,
        },
      };

      const response = await axios(params);
      const validated = response.data;
      return validated;
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
