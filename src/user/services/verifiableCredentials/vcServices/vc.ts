import { EcdsaSecp256k1Signature2019 } from '@bloomprotocol/ecdsa-secp256k1-signature-2019';
import { EthrDID, KeyPair } from 'ethr-did';

import { EthrDid } from '../../decentralizedIdentity/didServices/ethrDid';
import { didDocumentLoader } from './documentLoader';
//import { Secp256k1KeyPair } from 'secp256k1-key-pair';
import {
  Secp256k1KeyPair,
  EcdsaSecp256k1VerificationKey2019,
} from '@transmute/secp256k1-key-pair';

import { EcdsaSecp256k1VerificationKey2019 } from '@bloomprotocol/ecdsa-secp256k1-verification-key-2019';
import {
  JsonWebKey,
  JsonWebKey2020,
  JsonWebSignature,
} from '@transmute/json-web-signature';
import { DIDResolutionResult } from 'did-resolver';
import { Signer } from 'did-jwt';

export class VerifiableCredential {
  private credential = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://w3id.org/security/suites/jws-2020/v1',
    ],
    id: 'http://example.edu/credentials/3732',
    type: ['VerifiableCredential'],
    issuer: {
      id: 'id',
    },
    issuanceDate: '2010-01-01T19:23:24Z',
    credentialSubject: {
      id: 'did:example:ebfeb1f712ebc6f1c276e12ec21',
    },
  };

  async generateKey(
    issuerId: EthrDID,
    issuerKey: string,
  ): Promise<Secp256k1KeyPair> {
    const keypair = await Secp256k1KeyPair.generate({
      secureRandom: () => {
        return Buffer.from(issuerKey, 'hex');
      },
    });
    const fingerprint = await keypair.fingerprint();
    keypair.id = `${issuerId.did}#${fingerprint}`;
    keypair.controller = issuerId.did;

    return keypair;
  }

  async generateSuite(issuerKeyPair: Secp256k1KeyPair) {
    const jwk = await issuerKeyPair.export({
      type: 'JsonWebKey2020',
    });

    JsonWebKey.from(jwk);

    const suite = new EcdsaSecp256k1Signature2019({
      key: keypair,
    });
    return suite;
  }
}
