import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserDto } from './dto/request/createUser.dto';
import { UpdateUserBankValidationDto } from './dto/request/updateUserBankValidation.dto';
import { GetAllUsersQuery } from '../capabilities/getAllUsers/getAllUsers.query';
import { GetUserByIdQuery } from '../capabilities/getUserById/getUserById.query';
import { CreateUserCommand } from '../capabilities/createUser/createUser.command';
import { ValidateUserBankDetailsCommand } from '../capabilities/validateUserBankDetails/validateUserBankDetails.command';
import { UpdateUserBankValidationCommand } from '../capabilities/updateUserBankValidation/updateUserBankValidation.command';
import { ValidateUserPanDetailsCommand } from '../capabilities/validateUserPanDetails/validateUserPanDetails.command';
import { DeleteUserCommand } from '../capabilities/deleteUser/deleteUser.command';

import { UserDto } from './dto/response/user.dto';
import { ValidateUserBankDetailsDto } from './dto/request/validateUserBankDetails.dto';
import { ValidateUserPanDetailsDto } from './dto/request/validateUserPANDetails.dto';

@Controller('user')
export class UserController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Get()
  async getUsers(): Promise<UserDto[]> {
    return await this.queryBus.execute(new GetAllUsersQuery());
  }

  @Get('/:id')
  async getUserById(@Param('id') id: string): Promise<UserDto> {
    return await this.queryBus.execute(new GetUserByIdQuery(id));
  }

  @Post()
  async createUser(@Body() requestDto: CreateUserDto): Promise<UserDto> {
    return await this.commandBus.execute(
      new CreateUserCommand(requestDto.name),
    );
  }

  @Post('/validate/bank')
  async validateUserBankDetails(
    @Body() requestDto: ValidateUserBankDetailsDto,
  ): Promise<UserDto> {
    return await this.commandBus.execute(
      new ValidateUserBankDetailsCommand(
        requestDto.id,
        requestDto.beneficiaryName,
        requestDto.ifsc,
        requestDto.accountNumber,
      ),
    );
  }

  @Post('/validate/bank/completed')
  async updateUserBankValidationStatus(
    @Body() requestDto: UpdateUserBankValidationDto,
  ): Promise<UserDto> {
    return await this.commandBus.execute(
      new UpdateUserBankValidationCommand(
        requestDto.userId,
        requestDto.validatedAccount,
      ),
    );
  }

  @Post('/validate/pan')
  async validatePanDetails(
    @Body() requestDto: ValidateUserPanDetailsDto,
  ): Promise<UserDto> {
    return await this.commandBus.execute(
      new ValidateUserPanDetailsCommand(requestDto.id, requestDto.panNumber),
    );
  }

  // @Put('/:id')
  // async updateUserStatus(
  //   @Param('id') id: string,
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   @Body() requestDto: UpdateUserDto,
  // ): Promise<UserDto> {
  //   return await this.commandBus.execute(new UpdateUserStatusCommand(id));
  // }

  @Delete('/:id')
  async removeUser(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteUserCommand(id));
  }
}
