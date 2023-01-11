import { RazorpayAccount } from '../../models/razorpayAccount';
export class UpdateUserBankValidationCommand {
  constructor(
    public readonly userId,
    public readonly validatedAccount: RazorpayAccount,
  ) {}
}
