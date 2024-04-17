import { ZeroKnowledge } from './zk';
import { ZKRecursiveCircuit } from './circuit/zkRecursiveCircuit';

describe('Call ZeroKnowledge API', () => {
  jest.setTimeout(200000);
  it('should create a zk proof', async () => {
    const zk = new ZeroKnowledge();
    const { proof, publicSignals } = await zk.createProof({
      phoneNumber: '1234567890',
    });

    const witness = {
      pi_a: proof.pi_a,
      pi_b: proof.pi_b,
      pi_c: proof.pi_c,
    };

    console.log(witness);
    console.log(publicSignals[0]);
    const isVerified = await zk.verifyProof(witness, publicSignals);
    globalThis.curve_bn128.terminate();
    expect(isVerified).toEqual(true);
  });

  it('recursive zk proof', async () => {
    const zk = new ZKRecursiveCircuit();
    await zk.createCircuit();
  });
});
