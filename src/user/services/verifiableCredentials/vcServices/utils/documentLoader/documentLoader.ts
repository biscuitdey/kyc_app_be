import { didDocumentLoader } from './didDocumentLoader';
import cred from './context/cred-v1.json';
import trace from './context/trace-v1.json';
import dids from './context/did-v1.json';

const contexts = {
  'https://www.w3.org/2018/credentials/v1': cred,
  'https://w3id.org/traceability/v1': trace,
  'https://www.w3.org/ns/did/v1': dids,
};

export class DocumentLoader {
  async loader(iri) {
    if (contexts[iri]) {
      return { document: contexts[iri] };
    }

    const didDocment = (await didDocumentLoader(iri)).document;
    return { document: didDocment };
  }
}
