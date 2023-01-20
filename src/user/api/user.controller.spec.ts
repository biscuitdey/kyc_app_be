import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { CreateUserCommandHandler } from '../capabilities/createUser/createUserCommand.handler';
import { DeleteUserCommandHandler } from '../capabilities/deleteUser/deleteUserCommand.handler';
import { GetAllUsersQueryHandler } from '../capabilities/getAllUsers/getAllUsersQuery.handler';
import { GetUserByIdQueryHandler } from '../capabilities/getUserById/getUserByIdQuery.handler';
import { UpdateUserStatusCommandHandler } from '../capabilities/updateUserStatus/updateUserStatusCommand.handler';
import { CreateUserDto } from './dto/request/createUser.dto';
import { UserAgent } from '../agent/user.agent';
import { UserStorageAgent } from '../agent/userStorage.agent';
import { User } from '../models/user';
import { ValidateUserBankDetailsCommandHandler } from '../capabilities/validateUserBankDetails/validateUserBankDetailsCommand.handler';
import { ValidateUserPanDetailsCommandHandler } from '../capabilities/validateUserPanDetails/validateUserPanDetailsCommand.handler';
import { BankAccountValidationService } from '../services/bankAccountDetailsValidation/bankAccountValidation.service';
import { PanValidationService } from '../services/panDetailsValidation/panValidation.service';
import { Razorpay } from '../services/bankAccountDetailsValidation/validationAPIServices/razorpay/razorpay';
import { EKO } from '../services/panDetailsValidation/validationAPIServices/eko/eko';
import { MockUserStorageAgent } from '../agent/mockUserStorage.agent';
import { ValidateUserPanDetailsDto } from './dto/request/validateUserPANDetails.dto';
import { UpdateUserBankValidationCommandHandler } from '../capabilities/updateUserBankValidation/updateUserBankValidationCommand.handler';

describe('UserController', () => {
  let controller: UserController;
  let mockUser: User;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [UserController],
      providers: [
        CreateUserCommandHandler,
        UpdateUserStatusCommandHandler,
        DeleteUserCommandHandler,
        GetAllUsersQueryHandler,
        GetUserByIdQueryHandler,
        ValidateUserBankDetailsCommandHandler,
        UpdateUserBankValidationCommandHandler,
        ValidateUserPanDetailsCommandHandler,
        UserAgent,
        UserStorageAgent,
        BankAccountValidationService,
        PanValidationService,
        Razorpay,
        EKO,
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn().mockResolvedValue(mockUser),
            find: jest.fn().mockResolvedValue([mockUser]),
            register: jest.fn().mockResolvedValue(mockUser),
            findOneBy: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    })
      .overrideProvider(UserStorageAgent)
      .useValue(new MockUserStorageAgent())
      .compile();

    controller = app.get<UserController>(UserController);

    await app.init();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('CreateUser', () => {
    it('should create an user and store in db', async () => {
      const requestDto = { name: 'Biswashree Dey' } as CreateUserDto;

      const response = await controller.createUser(requestDto);

      expect(response.name).toEqual('Biswashree Dey');
    });
  });

  describe('GetAllUsers', () => {
    it('should get all the users', async () => {
      //Arrange
      const createUser1Dto = { name: 'Danny Smith' } as CreateUserDto;
      const createUser2Dto = { name: 'Jack Smith' } as CreateUserDto;

      await controller.createUser(createUser1Dto);
      await controller.createUser(createUser2Dto);

      //Act
      const response = await controller.getUsers();

      //Assert
      expect(response[0].name).toEqual('Danny Smith');
      expect(response[1].name).toEqual('Jack Smith');
    });
  });

  describe('GetUserById', () => {
    it('should get user by their id', async () => {
      //Arrange
      const createUserDto = { name: 'David So' } as CreateUserDto;

      const user = await controller.createUser(createUserDto);

      //Act
      const response = await controller.getUserById(user.id);

      //Assert
      expect(response.id).toEqual(user.id);
      expect(response.name).toEqual('David So');
    });
  });

  describe('ValidateUserPanDetails', () => {
    it('should validate pan card of user and update their pan validation status', async () => {
      //Arrange
      const createUserDto = { name: 'Shovona Dey' } as CreateUserDto;

      const user = await controller.createUser(createUserDto);

      const validatePanDto = {
        id: user.id,
        panNumber: 'ABEPD3036E',
      } as ValidateUserPanDetailsDto;

      //Act
      const response = await controller.validatePanDetails(validatePanDto);

      //Assert
      expect(response.name).toEqual('Shovona Dey');
      expect(response.panStatus).toEqual('PAN verification successful');
    });
  });

  // describe('UpdateUserStatus', () => {
  //   it('Should create an user and store in db', async () => {
  //     //Arrange
  //     const createUserDto = { name: 'Shovona Dey' } as CreateUserDto;
  //     const user = await controller.createUser(createUserDto);
  //     const updateUserDto = {} as UpdateUserDto;

  //     //Act
  //     const response = await controller.updateUserStatus(
  //       user.id,
  //       updateUserDto,
  //     );

  //     expect(response.name).toEqual('Shovona Dey');
  //     expect(response.status).toEqual('Verified');
  //   });
  // });

  describe('DeleteUser', () => {
    it('Should create an user and store in db', async () => {
      const requestDto = { name: 'Biswashree Dey' } as CreateUserDto;

      const response = await controller.createUser(requestDto);

      expect(response.name).toEqual('Biswashree Dey');
    });
  });
});
