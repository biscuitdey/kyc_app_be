import { KeyPair } from 'ethr-did';
import { DocumentLoader } from './utils/documentLoader/documentLoader';
import { Secp256k1KeyPair } from '@transmute/secp256k1-key-pair';
import { DIDDocument } from 'did-resolver';
import bs58 from 'bs58';
import { EcdsaSecp256k1Signature2019 } from './utils/EcdsaSecp256k1Signature2019';
import { create } from './utils/vc/vc';

export class VerifiableCredential {
  async generateKey(
    issuerKeyPair: KeyPair,
    issuerDidDocument: DIDDocument,
  ): Promise<Secp256k1KeyPair> {
    const privateKeyBase58 = bs58.encode(
      Buffer.from(issuerKeyPair.privateKey.split('0x')[1], 'hex'),
    );

    const publicKeyBase58 = bs58.encode(
      Buffer.from(issuerKeyPair.publicKey.split('0x')[1], 'hex'),
    );

    const keypair = await Secp256k1KeyPair.from({
      id: issuerDidDocument.verificationMethod[1].id,
      type: 'EcdsaSecp256k1VerificationKey2019',
      controller: issuerDidDocument.verificationMethod[1].controller,
      privateKeyBase58: privateKeyBase58,
      publicKeyBase58: publicKeyBase58,
    });

    return keypair;
  }

  async generateSuite(
    issuerKeyPair: Secp256k1KeyPair,
  ): Promise<EcdsaSecp256k1Signature2019> {
    const suite = new EcdsaSecp256k1Signature2019({
      key: issuerKeyPair,
    });

    return suite;
  }

  async generateVC(credential: any, suite: EcdsaSecp256k1Signature2019) {
    const documentLoader = new DocumentLoader().loader;
    const result = await create({
      credential,
      format: ['vc'],
      documentLoader: documentLoader,
      suite: suite,
    });

    return result;
  }
}
