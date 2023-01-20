import { AutoMap } from '@automapper/classes';

export class UserDto {
  @AutoMap()
  id: string;

  @AutoMap()
  name: string;

  @AutoMap()
  validated: boolean;

  @AutoMap()
  panStatus: string;

  @AutoMap()
  bankStatus: string;
}
