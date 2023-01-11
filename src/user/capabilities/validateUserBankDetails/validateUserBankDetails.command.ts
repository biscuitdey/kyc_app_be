export class ValidateUserBankDetailsCommand {
  constructor(
    public readonly id: string,
    public readonly beneficiaryName: string,
    public readonly ifsc: string,
    public readonly accountNumber: string,
  ) {}
}
