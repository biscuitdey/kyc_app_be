import { EthrDid } from './ethrDid';

describe('Call Ethr-Did API', () => {
  it('should create did', async () => {
    const didService = new EthrDid();

    const issuerKeypair = await didService.createKeypair();
    const issuerDid = await didService.createDid(issuerKeypair);

    const didResolver = await didService.getDidResolver();

    const didDocument = await didResolver.resolve(issuerDid.did);

    expect(didDocument).toEqual(didDocument);
  });
});
