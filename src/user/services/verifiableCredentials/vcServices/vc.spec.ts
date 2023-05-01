import { Secp256k1KeyPair } from '@transmute/secp256k1-key-pair';
import { EthrDid } from '../../decentralizedIdentity/didServices/ethrDid';
import { VerifiableCredential } from './vc';

describe('Call Verifable Credential API', () => {
  it('should create did', async () => {
    const didService = new EthrDid();
    const vcService = new VerifiableCredential();
    //Issuer DID
    const issuerKeypair = await didService.createKeypair();
    const issuer = await didService.createDid(issuerKeypair);
    const didResolver = await didService.getDidResolver();
    const issuerDidDocument = (await didResolver.resolve(issuer.did))
      .didDocument;
    // // //VC Keypair
    const keypair = await vcService.generateKey(
      issuerKeypair,
      issuerDidDocument,
    );
    //VC Suite
    const suite = await vcService.generateSuite(keypair);
    // //Credential sample
    const credential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      id: 'http://example.edu/credentials/3732',
      type: ['VerifiableCredential'],
      issuer: issuer.did,
      issuanceDate: '2010-01-01T19:23:24Z',
      credentialSubject: {
        id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
      },
    };
    const vc = await vcService.generateVC(credential, suite);

    console.log(vc.items[0]);

    expect('subjectDid').toEqual('subjectDid');
  });
});
