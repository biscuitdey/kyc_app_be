import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ValidateUserPanDetailsCommand } from './validateUserPanDetails.command';
import { UserAgent } from '../../agent/user.agent';
import { UserStorageAgent } from '../../agent/userStorage.agent';
import { User } from '../../models/user';

@CommandHandler(ValidateUserPanDetailsCommand)
export class ValidateUserPanDetailsCommandHandler
  implements ICommandHandler<ValidateUserPanDetailsCommand>
{
  constructor(
    private readonly agent: UserAgent,
    private readonly storageAgent: UserStorageAgent,
  ) {}

  async execute(command: ValidateUserPanDetailsCommand): Promise<User> {
    const validationStatus = await this.agent.validatePanDetails(
      command.panNumber,
    );

    const user = await this.storageAgent.updateUserPanStatusById(
      command.id,
      validationStatus.status,
    );

    return user;
  }
}
