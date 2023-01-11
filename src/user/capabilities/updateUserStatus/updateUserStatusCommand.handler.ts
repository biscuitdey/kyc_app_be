import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserStatusCommand } from './updateUserStatus.command';
import { UserStorageAgent } from '../../agent/userStorage.agent';
import { UserAgent } from '../../agent/user.agent';
import { User } from 'src/user/models/user';
@CommandHandler(UpdateUserStatusCommand)
export class UpdateUserStatusCommandHandler
  implements ICommandHandler<UpdateUserStatusCommand>
{
  constructor(
    private readonly agent: UserAgent,
    private readonly storageAgent: UserStorageAgent,
  ) {}
  async execute(command: UpdateUserStatusCommand): Promise<User> {
    // const isValidatedBankAccountDetails = await this.agent.validateBankAccountDetails(
    //   command.id,
    // );
    // const isValidatedCreditDetails = await this.agent.validateCreditDetails(
    //   command.id,
    // );
    // const isValidatedPersonalDetails = await this.agent.validatePersonalDetails(
    //   command.id,
    // );
    // let user: User;
    // if (
    //   isValidatedBankAccountDetails &&
    //   isValidatedCreditDetails &&
    //   isValidatedPersonalDetails
    // ) {
    //   user = await this.storageAgent.updateUserStatusById(
    //     command.id,
    //     'Verified',
    //   );
    // } else {
    //   user = await this.storageAgent.updateUserStatusById(
    //     command.id,
    //     'Verified',
    //   );
    // }
    // return user;

    return await this.storageAgent.findOneUserById(command.id);
  }
}
