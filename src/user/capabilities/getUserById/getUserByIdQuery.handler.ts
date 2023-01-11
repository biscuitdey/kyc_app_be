import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserByIdQuery } from './getUserById.query';
import { UserStorageAgent } from '../../agent/userStorage.agent';
import { User } from '../../models/user';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdQueryHandler
  implements IQueryHandler<GetUserByIdQuery>
{
  constructor(private readonly storageAgent: UserStorageAgent) {}

  async execute(query: GetUserByIdQuery): Promise<User> {
    return await this.storageAgent.findOneUserById(query.id);
  }
}
