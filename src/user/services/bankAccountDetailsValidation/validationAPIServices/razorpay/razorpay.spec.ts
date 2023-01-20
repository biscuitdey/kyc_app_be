import { Razorpay } from './razorpay';
import { APIService } from '../../../../utilities/apiCall.service';
describe('Testing RazorPay API calls', () => {
  const razorPayAPI = new Razorpay(new APIService());
  let newAccount;
  let newFundAccount;

  it('should create a new user account', async () => {
    newAccount = await razorPayAPI.createAccount('John D. Smith');
    expect(newAccount.name).toEqual('John D. Smith');
  });

  it('should create a new fund account', async () => {
    newFundAccount = await razorPayAPI.createFundAccount(
      newAccount,
      'HDFC0000053',
      '765432123456789',
    );
    const bankAccountDetails = newFundAccount['bank_account'];

    expect(bankAccountDetails['name']).toEqual('John D. Smith');
    expect(bankAccountDetails['ifsc']).toEqual('HDFC0000053');
    expect(bankAccountDetails['account_number']).toEqual('765432123456789');
  });

  it('should validate the bank account details', async () => {
    const response = await razorPayAPI.validateAccount(newFundAccount.id);

    expect(response.status).toEqual('created');
  });
});
