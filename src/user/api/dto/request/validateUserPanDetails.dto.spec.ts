import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidateUserPanDetailsDto } from './validateUserPANDetails.dto';
describe('ValidateUserBankDetails', () => {
  it('should throw an error if id is not provided', async () => {
    //Arrange
    const dto = { panNumber: 'VBLPZ6447L' };
    const validateUserPanDetailsDto = plainToInstance(
      ValidateUserPanDetailsDto,
      dto,
    );

    //Act
    const errors = await validate(validateUserPanDetailsDto);

    //Assert
    expect(errors.length).toBe(1);
    expect(errors[0].property).toEqual('id');
    expect(errors[0].constraints.isNotEmpty).toContain(
      'id should not be empty',
    );
  });

  it('should throw an error if panNumber is not provided', async () => {
    //Arrange
    const dto = { id: '123' };
    const validateUserPanDetailsDto = plainToInstance(
      ValidateUserPanDetailsDto,
      dto,
    );

    //Act
    const errors = await validate(validateUserPanDetailsDto);

    //Assert
    expect(errors.length).toBe(1);
    expect(errors[0].property).toEqual('panNumber');
    expect(errors[0].constraints.isNotEmpty).toContain(
      'panNumber should not be empty',
    );
  });

  it('should create a pan details dto', async () => {
    //Arrange
    const dto = {
      id: '123',
      panNumber: 'VBLPZ6447L',
    };
    const validateUserPanDetailsDto = plainToInstance(
      ValidateUserPanDetailsDto,
      dto,
    );

    //Act
    const errors = await validate(validateUserPanDetailsDto);

    //Assert
    expect(errors.length).toBe(0);
  });
});
