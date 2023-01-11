import { EKO } from './eko';

describe('Call Eko API to validate PAN details', () => {
  it('should return validated PAN', async () => {
    const ekoAPIService = new EKO();

    const panNumber = 'VBLPZ6447L';

    const result = await ekoAPIService.validatePAN(panNumber);

    expect(result.status).toEqual('PAN verification successful');
    expect(result.panNumber).toEqual('VBLPZ6447L');
  });
});
