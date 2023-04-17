import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccountValidationModule } from './services/bankAccountDetailsValidation/bankAccountValidation.module';
import { UserController } from './api/user.controller';
import { User } from './models/user';
import { UserAgent } from './agent/user.agent';
import { UserStorageAgent } from './agent/userStorage.agent';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserCommandHandler } from './capabilities/createUser/createUserCommand.handler';
import { DeleteUserCommandHandler } from './capabilities/deleteUser/deleteUserCommand.handler';
import { GetAllUsersQueryHandler } from './capabilities/getAllUsers/getAllUsersQuery.handler';
import { GetUserByIdQueryHandler } from './capabilities/getUserById/getUserByIdQuery.handler';
import { UpdateUserStatusCommandHandler } from './capabilities/updateUserStatus/updateUserStatusCommand.handler';
import { PanValidationModule } from './services/panDetailsValidation/panValidation.module';
import { ValidateUserBankDetailsCommandHandler } from './capabilities/validateUserBankDetails/validateUserBankDetailsCommand.handler';
import { ValidateUserPanDetailsCommandHandler } from './capabilities/validateUserPanDetails/validateUserPanDetailsCommand.handler';
import { UpdateUserBankValidationCommandHandler } from './capabilities/updateUserBankValidation/updateUserBankValidationCommand.handler';
import { DidModule } from './services/decentralizedIdentity/did.module';

export const CommandHandler = [
  CreateUserCommandHandler,
  UpdateUserStatusCommandHandler,
  ValidateUserBankDetailsCommandHandler,
  UpdateUserBankValidationCommandHandler,
  ValidateUserPanDetailsCommandHandler,
  DeleteUserCommandHandler,
];

export const QueryHandler = [GetAllUsersQueryHandler, GetUserByIdQueryHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([User]),
    BankAccountValidationModule.register({
      folder: './services/bankAccountDetailsValidation/validationAPIServices',
    }),
    PanValidationModule.register({
      folder: './services/panDetailsValidation/validationAPIServices',
    }),
    DidModule.register({
      folder: './services/decentralizedIdentity/didServices',
    }),
  ],
  controllers: [UserController],
  providers: [...CommandHandler, ...QueryHandler, UserAgent, UserStorageAgent],
})
export class UserModule {}
