import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserCommand } from './deleteUser.command';
import { UserAgent } from '../../agent/user.agent';
import { UserStorageAgent } from '../../agent/userStorage.agent';

@CommandHandler(DeleteUserCommand)
export class DeleteUserCommandHandler
  implements ICommandHandler<DeleteUserCommand>
{
  constructor(
    private readonly agent: UserAgent,
    private readonly storageAgent: UserStorageAgent,
  ) {}
  async execute(command: DeleteUserCommand): Promise<void> {
    await this.storageAgent.deleteUserById(command.id);
  }
}
