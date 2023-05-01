import { sign } from '../linked-data-proof/sign';
import { checkCredential } from './checkCredential';
import { CredentialIssuancePurpose } from './credentialIssuancePurpose';
import { CreateCredentialOptions } from '@transmute/vc.js/dist/types/CreateCredentialOptions';
import { CreateCredentialResult } from '@transmute/vc.js/dist/types/CreateCredentialResult';

const createVerifiableCredential = async (options: {
  credential: any;
  suite: any;
  documentLoader: any;
  strict?: 'ignore' | 'warn' | 'throw';
}) => {
  const { credential, suite, documentLoader } = options;

  const strict = options.strict || 'ignore';

  // run common credential checks
  if (!credential) {
    throw new TypeError('"credential" parameter is required for issuing.');
  }

  await checkCredential(credential, { documentLoader, strict });

  if (!documentLoader) {
    throw new TypeError('"documentLoader" parameter is required for issuing.');
  }

  if (!suite) {
    throw new TypeError('"suite" parameter is required for issuing.');
  }
  // check to make sure the `suite` has required params
  // Note: verificationMethod defaults to publicKey.id, in suite constructor...
  // ...in some implementations...

  if (!suite.verificationMethod) {
    throw new TypeError('"suite.verificationMethod" property is required.');
  }

  const purpose = new CredentialIssuancePurpose();

  return sign(credential, { purpose, ...options });
};

export const create = async (options: any): Promise<CreateCredentialResult> => {
  const result: CreateCredentialResult = {
    items: [],
  };

  if (!options.format) {
    options.format = ['vc'];
  }

  if (options.format.includes('vc')) {
    result.items.push(
      await createVerifiableCredential({
        credential: options.credential,
        suite: options.suite,
        documentLoader: options.documentLoader,
      }),
    );
  }

  return result;
};
