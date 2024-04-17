import * as snarkjs from 'snarkjs';
import * as phoneVerificationKey from '../../../../../zk/phoneNumber_verification_key.json';
import * as fs from 'fs';

export class ZeroKnowledge {
  async createProof(input: any): Promise<any> {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      'zk/phoneNumber_js/phoneNumber.wasm',
      'zk/zkey/phoneNumber_final.zkey',
    );
    return { proof, publicSignals };
  }

  async verifyProof(proof, publicInput): Promise<boolean> {
    const isVerified = await snarkjs.groth16.verify(
      phoneVerificationKey,
      publicInput,
      proof,
    );
    return isVerified;
  }

  async getWasmModuleInstance(path: string): Promise<any> {
    const wasmFile = fs.readFileSync(path);
    const bytes = await Buffer.from(wasmFile);
    return bytes;
  }
}
