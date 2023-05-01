import jsonld from 'jsonld';
import { JsonLdDocument, Options } from 'jsonld';
import pointer from 'json-pointer';

const isAbsoluteIri = (id: string) => {
  const isAbsoluteRegex = /^([A-Za-z][A-Za-z0-9+-.]*|_):[^\s]*$/;
  return isAbsoluteRegex.test(id);
};

const validateIds = (object: typeof JsonLdDocument) => {
  const dict = pointer.dict(object);
  const errors: string[] = [];
  for (const [key, value] of Object.entries(dict)) {
    const keyToCheck = key.split('/').pop();
    if (keyToCheck === '@id' || keyToCheck === 'id') {
      const isValidIRI = isAbsoluteIri(value as string);
      if (!isValidIRI) {
        errors.push(
          `Invalid JSON-LD ID at ${key}. Using this value would allow the data in the object to be mutable.`,
        );
      }
    }
  }
  if (errors.length > 0) {
    throw new Error(JSON.stringify(errors));
  }
};

export const safeCanonize = async (
  input: typeof JsonLdDocument,
  { documentLoader, expansion, skipExpansion }: typeof Options.Normalize,
) => {
  validateIds(input);
  try {
    const nquads = await jsonld.canonize(input, {
      algorithm: 'URDNA2015',
      format: 'application/n-quads',
      documentLoader,
      expansion,
      skipExpansion,
      useNative: false,
    });
    return nquads;
  } catch (e) {
    console.log(e);
    throw new Error('Document cannot produce nquads.');
  }
};
