pragma circom 2.1.5;

include "../../../../../../node_modules/circomlib/circuits/mimcsponge.circom";

template phoneNumber(){
	signal input phoneNumber;

	signal output hash;

	/* check MiMCSponge(x) = pub */
	component mimc = MiMCSponge(1, 220, 1);

	mimc.ins[0] <== phoneNumber;

	mimc.k <== 0;

	hash <== mimc.outs[0];

}

component main = phoneNumber();