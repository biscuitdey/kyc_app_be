import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './createUser.command';
import { UserAgent } from '../../agent/user.agent';
import { UserStorageAgent } from '../../agent/userStorage.agent';
import { User } from '../../models/user';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand>
{
  constructor(
    private readonly agent: UserAgent,
    private readonly storageAgent: UserStorageAgent,
  ) {}
  async execute(command: CreateUserCommand): Promise<User> {
    const user = this.agent.createUser(command.name);

    const storedUser = await this.storageAgent.storeUser(user);

    return storedUser;
  }
}
