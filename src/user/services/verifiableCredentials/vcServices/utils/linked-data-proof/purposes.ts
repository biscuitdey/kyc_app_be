import { IPurposeValidateOptions } from './types';
import jsonld from '../json-ld/index';

class ProofPurpose {
  public term: any;
  public date: any;
  public maxTimestampDelta: any;

  constructor({ term, date, maxTimestampDelta = Infinity }: any = {}) {
    if (term === undefined) {
      throw new Error('"term" is required.');
    }
    if (
      maxTimestampDelta !== undefined &&
      typeof maxTimestampDelta !== 'number'
    ) {
      throw new TypeError('"maxTimestampDelta" must be a number.');
    }
    this.term = term;
    if (date !== undefined) {
      this.date = new Date(date);
      if (isNaN(this.date)) {
        throw TypeError(`"date" "${date}" is not a valid date.`);
      }
    }
    this.maxTimestampDelta = maxTimestampDelta;
  }

  async validate(proof: any, _options: IPurposeValidateOptions) {
    try {
      // check expiration
      if (this.maxTimestampDelta !== Infinity) {
        const expected = (this.date || new Date()).getTime();
        const delta = this.maxTimestampDelta * 1000;
        const created = new Date(proof.created).getTime();
        // comparing this way handles NaN case where `created` is invalid
        if (!(created >= expected - delta && created <= expected + delta)) {
          throw new Error("The proof's created timestamp is out of range.");
        }
      }
      return { valid: true };
    } catch (error) {
      return { valid: false, error };
    }
  }

  /**
   * Called to update a proof when it is being created, adding any properties
   * specific to this purpose. This method is called prior to the proof
   * value being generated such that any properties added may be, for example,
   * included in a digital signature value.
   *
   * @param proof {object} the proof, in the `constants.SECURITY_CONTEXT_URL`
   *   to update.
   *
   * @return {Promise<object>} resolves to the proof instance (in the
   *   `constants.SECURITY_CONTEXT_URL`.
   */
  async update(proof: any, _options: IPurposeValidateOptions) {
    proof.proofPurpose = this.term;
    return proof;
  }

  /**
   * Determines if the given proof has a purpose that matches this instance,
   * i.e. this ProofPurpose instance should be used to validate the given
   * proof.
   *
   * @param proof {object} the proof to check.
   *
   * @return {Promise<boolean>} `true` if there's a match, `false` if not.
   */
  async match(
    proof: any,
    // { document, documentLoader, expansionMap }
  ) {
    return proof.proofPurpose === this.term;
  }
}

class ControllerProofPurpose extends ProofPurpose {
  public controller: any;
  constructor({ term, date, maxTimestampDelta = Infinity }: any = {}) {
    super({ term, date, maxTimestampDelta });
  }

  async validate(proof: any, _options: IPurposeValidateOptions) {
    try {
      const result: any = await super.validate(proof, _options);
      if (!result.valid) {
        throw result.error;
      }

      const { verificationMethod, documentLoader } = _options;
      const { id: verificationId } = verificationMethod;

      const { controller } = verificationMethod;
      const { id: controllerId } = controller;

      const { document } = await documentLoader(controllerId);
      result.controller = document;
      const verificationMethods = jsonld.getValues(
        result.controller,
        this.term,
      );

      result.valid = verificationMethods.some(
        (vm: any) =>
          vm === verificationId ||
          vm === '#' + verificationId.split('#').pop() ||
          (typeof vm === 'object' && vm.id === verificationId),
      );

      if (!result.valid) {
        throw new Error(
          `Verification method "${verificationMethod.id}" not authorized ` +
            `by controller for proof purpose "${this.term}".`,
        );
      }
      return result;
    } catch (error) {
      return { valid: false, error };
    }
  }
}

export class AssertionProofPurpose extends ControllerProofPurpose {
  constructor({
    term = 'assertionMethod',
    controller,
    date,
    maxTimestampDelta = Infinity,
  }: any = {}) {
    super({ term, controller, date, maxTimestampDelta });
  }
}
