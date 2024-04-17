import { SelfProof, Field, Experimental, verify } from 'snarkyjs';
export class ZKRecursiveCircuit {
  async createCircuit() {
    const FibonacciSequence = Experimental.ZkProgram({
      publicInput: Field,

      methods: {
        // those are our base cases that we start with - defined as:
        // fib_0 = 0
        // fib_1 = 1
        // we need a proof associated with the base cases so we can recursively verify their correctness
        fib0: {
          privateInputs: [],

          method(fib: Field) {
            fib.assertEquals(Field(0));
          },
        },
        fib1: {
          privateInputs: [],

          method(fib: Field) {
            fib.assertEquals(Field(1));
          },
        },

        inductiveFib: {
          privateInputs: [SelfProof, SelfProof],

          method(
            fib: Field,
            fib1: SelfProof<Field, Field>,
            fib2: SelfProof<Field, Field>,
          ) {
            // recursion below
            fib1.verify();
            fib2.verify();
            const newFib = fib1.publicInput.add(fib2.publicInput);
            fib.assertEquals(newFib);
          },
        },
      },
    });

    console.log('compiling ..');
    const { verificationKey } = await FibonacciSequence.compile();
    console.log('compiling finished');

    // proving: generating proof by doing the actual computation
    let fib_n_2 = await FibonacciSequence.fib0(Field(0));
    let fib_n_1 = await FibonacciSequence.fib1(Field(1));
    // following the formula fibn = fibn-1 + fibn-2
    let fib_n;
    // proving fib_N
    const N = 10;
    for (let n = 2; n <= N; n++) {
      console.log(`working on fib_${n}..`);
      const publicInput: Field = fib_n_1.publicInput.add(fib_n_2.publicInput);
      fib_n = await FibonacciSequence.inductiveFib(
        publicInput,
        fib_n_1,
        fib_n_2,
      );

      fib_n_2 = fib_n_1;
      fib_n_1 = fib_n;

      console.log(`got fib_${n} = ${fib_n.publicInput.toString()}`);
    }

    // verifying: verifier only needs the latest proof fib_n
    console.log('verify...');
    const ok = await verify(fib_n, verificationKey);
    console.log(`is ${fib_n.publicInput.toString()} in the sequence? ${ok}`);
  }
}
