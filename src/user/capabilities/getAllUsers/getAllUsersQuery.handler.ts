import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAllUsersQuery } from './getAllUsers.query';
import { UserStorageAgent } from '../../agent/userStorage.agent';
import { User } from '../../models/user';

@QueryHandler(GetAllUsersQuery)
export class GetAllUsersQueryHandler
  implements IQueryHandler<GetAllUsersQuery>
{
  constructor(private readonly storageAgent: UserStorageAgent) {}

  async execute(): Promise<User[]> {
    return await this.storageAgent.findAllUsers();
  }
}
