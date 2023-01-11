import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidateUserBankDetailsDto } from './validateUserBankDetails.dto';

describe('ValidateUserBankDetails', () => {
  it('should throw an error if beneficiaryName is not provided', async () => {
    //Arrange
    const dto = { id: '123', ifsc: '123', accountNumber: '123' };
    const validateUserBankDetailsDto = plainToInstance(
      ValidateUserBankDetailsDto,
      dto,
    );

    //Act
    const errors = await validate(validateUserBankDetailsDto);

    //Assert
    expect(errors.length).toBe(1);
    expect(errors[0].property).toEqual('beneficiaryName');
    expect(errors[0].constraints.isNotEmpty).toContain(
      'beneficiaryName should not be empty',
    );
  });

  it('should throw an error if ifsc is not provided', async () => {
    //Arrange
    const dto = { id: '123', beneficiaryName: '123', accountNumber: '123' };
    const validateUserBankDetailsDto = plainToInstance(
      ValidateUserBankDetailsDto,
      dto,
    );

    //Act
    const errors = await validate(validateUserBankDetailsDto);

    //Assert
    expect(errors.length).toBe(1);
    expect(errors[0].property).toEqual('ifsc');
    expect(errors[0].constraints.isNotEmpty).toContain(
      'ifsc should not be empty',
    );
  });

  it('should throw an error if accountNumber is not provided', async () => {
    //Arrange
    const dto = { id: '123', beneficiaryName: '123', ifsc: '123' };
    const validateUserBankDetailsDto = plainToInstance(
      ValidateUserBankDetailsDto,
      dto,
    );

    //Act
    const errors = await validate(validateUserBankDetailsDto);

    //Assert
    expect(errors.length).toBe(1);
    expect(errors[0].property).toEqual('accountNumber');
    expect(errors[0].constraints.isNotEmpty).toContain(
      'accountNumber should not be empty',
    );
  });

  it('should create a bank details dto', async () => {
    //Arrange
    const dto = {
      id: '123',
      beneficiaryName: 'John',
      ifsc: 'HDFC0000053',
      accountNumber: '765432123456789',
    };
    const validateUserBankDetailsDto = plainToInstance(
      ValidateUserBankDetailsDto,
      dto,
    );

    //Act
    const errors = await validate(validateUserBankDetailsDto);

    //Assert
    expect(errors.length).toBe(0);
  });
});
