import { InfuraProvider, AlchemyProvider } from '@ethersproject/providers';
import { EthrDID, KeyPair } from 'ethr-did';
import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';

export class EthrDid {
  private chainNameOrId = 'goerli';
  async createKeypair(): Promise<KeyPair> {
    const keypair = EthrDID.createKeyPair(this.chainNameOrId);
    return keypair;
  }

  async createDid(keypair: KeyPair): Promise<EthrDID> {
    const provider = new InfuraProvider('goerli', {
      projectId: process.env.INFURA_PROJECT_ID,
      projectSecret: process.env.INFURA_PROJECT_KEY,
    });
    //const provider = new AlchemyProvider('goerli', process.env.GOERLI_API_KEY);
    const did = new EthrDID({
      ...keypair,
      provider: provider,
      chainNameOrId: this.chainNameOrId,
    });
    return did;
  }

  async signJwtWithDid(did: EthrDID, message: string): Promise<string> {
    const jwt = await did.signJWT({ payload: message }, 60 * 60 * 24);
    return jwt;
  }

  async getDidResolver(): Promise<Resolver> {
    const provider = new InfuraProvider('goerli', {
      projectId: process.env.INFURA_PROJECT_ID,
      projectSecret: process.env.INFURA_PROJECT_KEY,
    });
    //const provider = new AlchemyProvider('goerli', process.env.GOERLI_API_KEY);

    const didResolver = new Resolver({
      ...getResolver({
        name: 'goerli',
        provider: provider,
      }),
    });
    return didResolver;
  }

  async verifyJwt(
    signer: EthrDID,
    jwt: string,
    didResolver: Resolver,
  ): Promise<boolean> {
    const { payload, issuer } = await signer.verifyJWT(jwt, didResolver);

    if (issuer === signer.did) {
      return true;
    }
    return false;
  }
}
