import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from '../../models/user';
import { UserAgent } from '../../agent/user.agent';
import { UserStorageAgent } from '../../agent/userStorage.agent';
import { ValidateUserBankDetailsCommand } from './validateUserBankDetails.command';

@CommandHandler(ValidateUserBankDetailsCommand)
export class ValidateUserBankDetailsCommandHandler
  implements ICommandHandler<ValidateUserBankDetailsCommand>
{
  constructor(
    private readonly agent: UserAgent,
    private readonly storageAgent: UserStorageAgent,
  ) {}

  async execute(command: ValidateUserBankDetailsCommand): Promise<User> {
    const validationStatus = await this.agent.validateBankAccountDetails(
      command.beneficiaryName,
      command.ifsc,
      command.accountNumber,
    );

    const updatedUser = await this.storageAgent.updateUserBankStatusById(
      command.id,
      validationStatus,
    );

    return updatedUser;
  }
}
