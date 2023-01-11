import { AutoMap } from '@automapper/classes';

export class UserDto {
  @AutoMap()
  id: string;

  @AutoMap()
  name: string;

  @AutoMap()
  status: boolean;
}
