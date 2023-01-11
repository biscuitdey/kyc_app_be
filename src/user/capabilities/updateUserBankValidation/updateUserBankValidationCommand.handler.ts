import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserAgent } from 'src/user/agent/user.agent';
import { UserStorageAgent } from 'src/user/agent/userStorage.agent';
import { UpdateUserBankValidationCommand } from './updateUserBankValidation.command';

@CommandHandler(UpdateUserBankValidationCommand)
export class UpdateUserBankValidationCommandHandler
  implements ICommandHandler<UpdateUserBankValidationCommand>
{
  constructor(
    private readonly agent: UserAgent,
    private readonly storageAgent: UserStorageAgent,
  ) {}

  async execute(command: UpdateUserBankValidationCommand): Promise<any> {
    const status = await this.agent.verifyValidatedBankAccountDetails(
      command.validatedAccount,
    );
    const verifiedUser = await this.storageAgent.updateUserBankStatusById(
      command.userId,
      status,
    );
    return verifiedUser;
  }
}
