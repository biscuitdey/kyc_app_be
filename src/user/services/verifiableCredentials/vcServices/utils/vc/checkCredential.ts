import moment from 'moment';
import jsonld from '../json-ld/index';
import { DocumentLoader } from '@transmute/vc.js/dist/types/DocumentLoader';
import CredentialCheck, {
  CredentialCheckObject,
} from '@transmute/vc.js/dist/types/CredentialCheck';
import { VerifiableCredential } from '@transmute/vc.js/dist/types/VerifiableCredential';

import Ajv from 'ajv';

const ajv = new Ajv();

// https://www.w3.org/TR/xmlschema11-2/#dateTime
// Modified for leap seconds
const xmlDateSchemaRegex =
  /-?([1-9][0-9]{3,}|0[0-9]{3})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T(([01][0-9]|2[0-3]):[0-5][0-9]:([0-5][0-9]|60)(\.[0-9]+)?|(24:00:00(\.0+)?))(Z|(\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))?/;

// Modified for leap seconds
const ISO_8601_FULL =
  /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5][0-9]([\.,]\d+)?|:60([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;

const TIME_ZONE_OFFSET_MATCH = /[+-]\d\d:\d\d$/;

class CheckResult {
  ok: boolean;
  error?: {
    type: string;
    details: string[];
  };
  constructor(ok: boolean, type = '', details = []) {
    this.ok = ok;
    if (!ok) {
      this.error = {
        type,
        details,
      };
    }
  }
}

// for the sake of safety, we check the date
// against ISO 8601 and moment.
// see also: https://github.com/w3c/vc-data-model/issues/782
const checkDate = (
  datetime: string,
  isJWT = false,
): { valid: boolean; warnings: string[] } => {
  const res: { valid: boolean; warnings: string[] } = {
    valid: false,
    warnings: [],
  };
  // open source vc, make sure validation tests date strings are the right format for the date
  if (!ISO_8601_FULL.test(datetime)) {
    res.warnings.push(`${datetime} is not a legal ISO 8601 Date Time.`);
  }

  if (!xmlDateSchemaRegex.test(datetime)) {
    res.warnings.push(
      `${datetime} is not a XMLSCHEMA11-2 date-time. See: https://www.w3.org/TR/vc-data-model/#issuance-date, https://www.w3.org/TR/xmlschema11-2/#dateTime`,
    );
  }

  moment.suppressDeprecationWarnings = true;
  // If leap second (60 seconds) make it a valid date
  let newDatetime = datetime;
  let isLeapSecond = false;
  try {
    if (newDatetime.split(':')[2].substring(0, 2) === '60') {
      newDatetime = newDatetime.replace('60', '59');
      const newDate = new Date(newDatetime);
      newDate.setSeconds(new Date(newDatetime).getSeconds() + 1);
      newDatetime = newDate.toISOString();
      isLeapSecond = true;
    }
  } catch (err) {}
  if (moment(newDatetime).toISOString() === null) {
    res.warnings.push(
      `${datetime} could not be parsed and serialized as ISO 8601 Date Time.`,
    );
  }

  if (isJWT) {
    if (isLeapSecond) {
      res.warnings.push(`${datetime} lost leap second information.`);
    }
    if (TIME_ZONE_OFFSET_MATCH.test(datetime)) {
      res.warnings.push(`${datetime} lost timezone offset information.`);
    }
    if (new Date(newDatetime).getMilliseconds()) {
      res.warnings.push(`${datetime} lost millisecond information.`);
    }
  }
  moment.suppressDeprecationWarnings = false;

  res.valid = res.warnings.length === 0;
  return res;
};

const check = async ({
  input,
  schema,
  documentLoader,
}: {
  input: string | object;
  schema?: any;
  documentLoader: (iri: string) => { document: any };
}) => {
  const customDocumentLoader = documentLoader;

  if (!documentLoader) {
    throw new Error('documentLoader is required when validating JSON-LD.');
  }

  try {
    let jsonldDoc: object;
    if (typeof input === 'string') {
      jsonldDoc = JSON.parse(input);
    } else {
      jsonldDoc = input;
    }

    if (schema) {
      const validate = ajv.compile(schema);
      const valid = validate(input);
      if (!valid) {
        return new CheckResult(
          false,
          'JSON_SCHEMA_VALIDATION_ERROR',
          validate.errors as any,
        );
      }
    }

    const unmappedProperties: string[] = [];

    const expansionMap = (info: any) => {
      if (info) {
        if (info.activeProperty) {
          unmappedProperties.push(
            `${info.activeProperty}.${info.unmappedProperty}`,
          );
        } else if (info.unmappedProperty) {
          unmappedProperties.push(info.unmappedProperty);
        }
      }
    };

    console.log(jsonldDoc);

    // Remove all keys not present in the jsonld context
    const expanded = await jsonld.expand(jsonldDoc, {
      documentLoader: customDocumentLoader,
      expansionMap,
    });

    console.log(expanded);

    await jsonld.compact(expanded, (jsonldDoc as any)['@context'], {
      documentLoader: customDocumentLoader,
    });

    if (unmappedProperties.length === 0) {
      return new CheckResult(true);
    }
    return new CheckResult(
      false,
      'MISSING_PROPERTIES_IN_CONTEXT',
      unmappedProperties as any,
    );
  } catch (err) {
    return new CheckResult(false, err.name, err.message);
  }
};

function _getId(obj: any) {
  if (typeof obj === 'string') {
    return obj;
  }

  if (!('id' in obj)) {
    return;
  }

  return obj.id;
}

const requireContext = (credential: CredentialCheckObject) => {
  if (!credential['@context']) {
    throw new Error(
      [
        'Verifiable credentials MUST include a @context property.',
        'See: https://www.w3.org/TR/vc-data-model/#dfn-context',
      ].join(''),
    );
  }
};

const requireDocumentLoader = (documentLoader?: DocumentLoader) => {
  if (!documentLoader) {
    throw new TypeError(
      '"documentLoader" parameter is required for checking presentations.',
    );
  }
};

const handleJWT = (
  credential: CredentialCheck,
): { isJWT: boolean; credential: CredentialCheckObject } => {
  let isJWT = false;
  let credentialObj: CredentialCheckObject;
  if (typeof credential === 'string') {
    const [encodedHeader, encodedPayload] = credential.split('.');
    const header = JSON.parse(Buffer.from(encodedHeader, 'base64').toString());
    if (!header.alg) {
      throw new Error('alg is required in JWT header');
    }
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64').toString(),
    );
    credentialObj = payload.vc;
    isJWT = true;
  } else {
    credentialObj = credential;
  }
  return { isJWT, credential: credentialObj };
};

const checkValidJsonLd = async (
  credential: VerifiableCredential,
  documentLoader: (iri: string) => { document: any },
) => {
  const isValidJsonLd = await check({ input: credential, documentLoader });
  if (!isValidJsonLd.ok) {
    throw new Error(
      `credential is not valid JSON-LD: ${JSON.stringify(
        isValidJsonLd.error,
        null,
        2,
      )}`,
    );
  }
};

const requireType = (credential: CredentialCheckObject) => {
  if (!credential['type']) {
    throw new Error(
      'Verifiable credentials MUST have a type specified. See: https://www.w3.org/TR/vc-data-model/#dfn-type',
    );
  }
};

const requireCredentialSubject = (credential: CredentialCheckObject) => {
  if (!credential['credentialSubject']) {
    throw new Error(
      'Verifiable credentials MUST include a credentialSubject property. See: https://www.w3.org/TR/vc-data-model/#credential-subject',
    );
  }
};

const checkType = (credential: CredentialCheckObject) => {
  if (!jsonld.getValues(credential, 'type').includes('VerifiableCredential')) {
    throw new Error(
      'Verifiable credentials type MUST include `VerifiableCredential`. See: https://www.w3.org/TR/vc-data-model/#dfn-type',
    );
  }
};
const requireIssuer = (credential: CredentialCheckObject) => {
  if (!credential['issuer']) {
    throw new Error(
      'Verifiable credentials MUST include a issuer property. See: https://www.w3.org/TR/vc-data-model/#issuer',
    );
  }
};

const requireIssuanceDate = (credential: CredentialCheckObject) => {
  if (!credential['issuanceDate']) {
    throw new Error(
      'Verifiable credentials MUST include a issuanceDate. See: https://www.w3.org/TR/vc-data-model/#issuance-date',
    );
  }
};

const checkIssuanceDate = (
  credential: VerifiableCredential,
  isJWT: boolean,
  strict: 'ignore' | 'warn' | 'throw',
) => {
  // check issuanceDate cardinality
  if (jsonld.getValues(credential, 'issuanceDate').length > 1) {
    throw new Error('"issuanceDate" property can only have one value.');
  }
  // check issued is a date
  const res = checkDate(credential.issuanceDate, isJWT);
  if (!res.valid) {
    const message = [
      'issuanceDate is not valid: ' + JSON.stringify(res.warnings, null, 2),
      'issuanceDate must be XML Datestring as defined in spec: https://w3c.github.io/vc-data-model/#issuance-date',
    ].join('\n');
    if (strict == 'warn') {
      console.warn(message);
    }
    if (strict == 'throw') {
      throw new Error(message);
    }
  }
};

const checkExpirationDate = (
  credential: VerifiableCredential,
  isJWT: boolean,
  strict: 'ignore' | 'warn' | 'throw',
) => {
  if ('expirationDate' in credential) {
    const res = checkDate(credential.expirationDate, isJWT);
    if (!res.valid) {
      const message = [
        'expirationDate is not valid: ' + JSON.stringify(res.warnings, null, 2),
        'expirationDate must be XML Datestring as defined in spec: https://w3c.github.io/vc-data-model/#expiration',
      ].join('\n');
      if (strict == 'warn') {
        console.warn(message);
      }
      if (strict == 'throw') {
        throw new Error(message);
      }
    }
  }
};

const checkIssuer = (credential: VerifiableCredential) => {
  // check issuer cardinality
  if (jsonld.getValues(credential, 'issuer').length > 1) {
    throw new Error('"issuer" property can only have one value.');
  }

  // https://www.rfc-editor.org/rfc/rfc3986#page-50
  const rfc3986Regex = new RegExp(
    '^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?',
  );
  if ('issuer' in credential) {
    const issuer = _getId(credential.issuer);
    if (!issuer) {
      throw new Error(
        `Verifiable credentials issuer:object MUST have an id. See: https://www.w3.org/TR/vc-data-model/#issuer`,
      );
    }
    if (!rfc3986Regex.test(issuer)) {
      throw new Error(
        'Verifiable credentials issuer:string MUST be a RFC3986 URI. See: https://www.w3.org/TR/vc-data-model/#issuer, https://www.rfc-editor.org/rfc/rfc3986',
      );
    }
    if (!issuer.includes(':')) {
      throw new Error(`"issuer" id must be a URL: ${issuer}`);
    }
  }
};

const checkCredentialStatus = (credential: VerifiableCredential) => {
  if ('credentialStatus' in credential) {
    if (!credential.credentialStatus.id) {
      throw new Error('"credentialStatus" must include an id.');
    }
    if (!credential.credentialStatus.type) {
      throw new Error('"credentialStatus" must include a type.');
    }
  }
};

const checkEvidence = (credential: VerifiableCredential) => {
  // check evidences are URLs
  // FIXME
  jsonld.getValues(credential, 'evidence').forEach((evidence: any) => {
    const evidenceId = _getId(evidence);
    if (evidenceId && !evidenceId.includes(':')) {
      throw new Error(`"evidence" id must be a URL: ${evidence}`);
    }
  });
};

const checkId = (credential: VerifiableCredential) => {
  // https://www.rfc-editor.org/rfc/rfc3986#page-50
  const rfc3986Regex = new RegExp(
    '^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?',
  );
  if (credential.id && !rfc3986Regex.test(credential.id)) {
    throw new Error(
      [
        'Verifiable credentials id (if exists) MUST be a RFC3986 URI.',
        'See: https://www.w3.org/TR/vc-data-model/#dfn-id',
      ].join(''),
    );
  }
};

const requireFields = (credential: any) => {
  requireContext(credential);
  requireType(credential);
  requireCredentialSubject(credential);
  requireIssuer(credential);
  requireIssuanceDate(credential);
};

const checkFields = (
  credential: VerifiableCredential,
  isJWT: boolean,
  strict: 'ignore' | 'warn' | 'throw',
) => {
  checkType(credential);
  checkIssuanceDate(credential, isJWT, strict);
  checkExpirationDate(credential, isJWT, strict);
  checkIssuer(credential);
  checkCredentialStatus(credential);
  checkEvidence(credential);
  checkId(credential);
};

export const checkCredential = async (
  credential: CredentialCheck,
  options: {
    documentLoader?: DocumentLoader;
    strict?: 'ignore' | 'warn' | 'throw';
  },
) => {
  const { documentLoader } = options;
  const strict = options.strict || 'warn';
  if (options.strict === 'ignore') {
    return undefined;
  }
  const { isJWT, credential: newCredential } = handleJWT(credential);
  credential = newCredential;

  requireDocumentLoader(documentLoader);
  requireFields(credential);
  checkFields(credential as VerifiableCredential, isJWT, strict);
  await checkValidJsonLd(
    credential as VerifiableCredential,
    documentLoader as unknown as (iri: string) => { document: any },
  );

  return undefined;
};
