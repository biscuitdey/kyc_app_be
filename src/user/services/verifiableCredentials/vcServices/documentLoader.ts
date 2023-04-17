import { DocumentLoader } from '@transmute/vc.js/dist/types/DocumentLoader';
import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';
import { AlchemyProvider } from '@ethersproject/providers';
import { DIDDocument } from 'did-resolver';

export const didDocumentLoader: DocumentLoader = async (
  did: string,
): Promise<{ documentUrl: string; document: DIDDocument }> => {
  const didResolver = new Resolver({
    ...getResolver({
      name: 'goerli',
      provider: new AlchemyProvider('goerli', process.env.GOERLI_API_KEY),
    }),
  });

  const didDocumentResult = await didResolver.resolve(did);

  return { documentUrl: did, document: didDocumentResult.didDocument };
};
