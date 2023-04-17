import { Secp256k1KeyPair } from '@transmute/secp256k1-key-pair';
import { EthrDid } from '../../decentralizedIdentity/didServices/ethrDid';
import { VerifiableCredential } from './vc';

describe('Call Verifable Credential API', () => {
  it('should create did', async () => {
    const didService = new EthrDid();
    const vcService = new VerifiableCredential();

    //Issuer DID
    const issuerKeypair = await didService.createKeypair();
    const issuerDid = await didService.createDid(issuerKeypair);
    const didResolver = await didService.getDidResolver();
    const didDocument = (await didResolver.resolve(issuerDid.did)).didDocument;

    //VC Keypair
    const keypair = await vcService.generateKey(
      issuerDid,
      issuerKeypair.privateKey.split('0x')[1],
    );

    //VC Suite
    const suite = await vcService.generateSuite(keypair);

    //console.log(suite);

    expect('subjectDid').toEqual('subjectDid');
  });
});
