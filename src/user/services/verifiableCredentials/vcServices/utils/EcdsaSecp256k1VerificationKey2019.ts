import { Secp256k1KeyPair } from '@transmute/secp256k1-key-pair';
import { JWS } from '@transmute/jose-ld';

export class EcdsaSecp256k1VerificationKey2019 extends Secp256k1KeyPair {
  static generate = async ({
    secureRandom,
  }: {
    secureRandom: () => Uint8Array;
  }) => {
    const k = await Secp256k1KeyPair.generate({ secureRandom });
    return new EcdsaSecp256k1VerificationKey2019(k);
  };

  static from = async (args: any) => {
    const k = await Secp256k1KeyPair.from(args);
    return new EcdsaSecp256k1VerificationKey2019(k);
  };
  constructor(args: any) {
    super(args);
    const JWA_ALG = 'ES256';
    const verifier = JWS.createVerifier(this.verifier('Ecdsa'), JWA_ALG, {
      detached: true,
    });
    this.verifier = () => verifier as any;

    if (this.privateKey) {
      const signer = JWS.createSigner(this.signer('Ecdsa'), JWA_ALG, {
        detached: true,
      });
      this.signer = () => {
        return {
          sign: async ({ data }: any) => {
            return signer.sign({ data });
          },
        } as any;
      };
    }
  }
}
