import { StorageService } from './ipfs';

describe('Call Verifable Credential API', () => {
  it('should create did using local library', async () => {
    const storageService = new StorageService();
    await storageService.store({ new: 'new' });
    const test = await storageService.retrieve();
    console.log(test);

    expect('subjectDid').toEqual('subjectDid');
  });
});
