pragma circom 2.1.5;

include "../../../../../../node_modules/circomlib/circuits/mimcsponge.circom";

template Fibonacci(numBits) {
  signal input a[2][numBits];

  signal output fibonacci[numBits];

  signal fibWitness[numBits];

  signal aFib[numBits];
  signal bFib[numBits];
  signal cFib[numBits];

}

template FibonacciMain(a, fibonacci) {
  signal aFib[];
  signal bFib[];
  signal cFib[];

  FibonacciSub(a, aFib, bFib);
  FibonacciSub(aFib, fibonacci, cFib);
}

template FibonacciSub(a, fibWitness, fibonacci) {
  fibonacci[0] <- a[0];
  fibonacci[1] <- a[1];

  for (i = 2; i < numBits; i = i + 1) {
    fibonacci[i] <- fibonacci[i - 1] + fibonacci[i - 2];
  }

  fibWitness <- fibonacci;
}

component main = FibonacciMain(a, fibonacci);
component sub1 = FibonacciSub(aFib, fibWitness[0], bFib);
component sub2 = FibonacciSub(bFib, fibWitness[1], cFib);