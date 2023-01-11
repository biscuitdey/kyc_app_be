import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from './createUser.dto';

describe('CreateUser', () => {
  it('should throw an error if name is not provided', async () => {
    //Arrange
    const dto = {};
    const createUserDto = plainToInstance(CreateUserDto, dto);

    //Act
    const errors = await validate(createUserDto);

    //Assert
    expect(errors.length).toBe(1);
    expect(errors[0].property).toEqual('name');
    expect(errors[0].constraints.isNotEmpty).toContain(
      'name should not be empty',
    );
  });
  it('should create a user', async () => {
    //Arrange
    const dto = { name: 'John' };
    const createUserDto = plainToInstance(CreateUserDto, dto);

    //Act
    const errors = await validate(createUserDto);

    //Assert
    expect(errors.length).toBe(0);
  });
});
