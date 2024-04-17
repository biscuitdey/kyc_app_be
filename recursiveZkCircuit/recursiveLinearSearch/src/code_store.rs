#![allow(clippy::upper_case_acronyms)]
#![allow(incomplete_features)]

use plonky2::field::extension::Extendable;
use plonky2::hash::hash_types::RichField;
use plonky2::iop::target::BoolTarget;
use plonky2::iop::witness::{PartialWitness, WitnessWrite};
use plonky2::plonk::circuit_builder::CircuitBuilder;
use plonky2::plonk::circuit_data::{CircuitConfig, CommonCircuitData, VerifierOnlyCircuitData};
use plonky2::plonk::config::GenericConfig;
use plonky2::plonk::proof::ProofWithPublicInputs;

pub struct EmailTarget {
    pub input_email_in_bits: Vec<BoolTarget>,
    pub is_verified: BoolTarget,
}

pub struct ProofTuple<F: RichField + Extendable<D>, C: GenericConfig<D, F = F>, const D: usize> {
    pub proof: ProofWithPublicInputs<F, C, D>,
    pub vd: VerifierOnlyCircuitData<C, D>,
    pub cd: CommonCircuitData<F, D>,
}

pub fn generate_is_email_exists_proof<
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F>,
    const D: usize,
>(
    email: String,
) -> ProofTuple<F, C, D> {
    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F, D>::new(config);

    //Assuming that both the input email is the same length as the stored email
    let stored_email = email.clone();
    let input_email = email.clone();

    let stored_email_length = stored_email.len();
    let email_target =
        make_is_email_exists_circuit(&mut builder, stored_email_length, stored_email);

    //Stored on IPFS
    let mut partial_witness = PartialWitness::new();
    fill_is_email_exists_circuit(&mut partial_witness, &input_email, &email_target);

    //Build the circuit
    let data = builder.build::<C>();
    let proof = data.prove(partial_witness).unwrap();

    ProofTuple {
        proof,
        vd: data.verifier_only,
        cd: data.common,
    }
}

pub fn verify_is_email_exists_proof_with_public_inputs<
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F>,
    const D: usize,
>() {
}

pub fn make_is_email_exists_circuit<F: RichField + Extendable<D>, const D: usize>(
    builder: &mut CircuitBuilder<F, D>,
    input_email_length: usize,
    stored_email: &String,
) -> EmailTarget {
    //1. STORED EMAIL AS STORED VALUE
    //Convert stored email into bits

    let stored_email_in_bytes = stored_email.as_bytes();
    let mut stored_email_in_bits = array_to_bits(stored_email_in_bytes);

    //2. INPUT EMAIL AS TARGET
    //Get input email length in bits
    let input_email_length_in_bits = input_email_length * 8;

    //Add targets for the emails
    let mut input_email_in_bits = Vec::new();

    for _ in 0..input_email_length_in_bits {
        let boolean_target = builder.add_virtual_bool_target_unsafe();
        builder.register_public_input(boolean_target.target);
        input_email_in_bits.push(boolean_target);
    }

    //3. VERIFY STORED EMAIL === INPUT EMAIL
    let mut is_verified = builder._true();
    for i in 0..input_email_length_in_bits {
        let result = builder.is_equal(
            builder.constant_bool(stored_email_in_bits[i]).target,
            input_email_in_bits[i].target,
        );

        is_verified = builder.and(result, is_verified);
    }

    builder.register_public_input(is_verified.target);

    return EmailTarget {
        input_email_in_bits,
        is_verified,
    };
}

pub fn fill_is_email_exists_circuit<F: RichField + Extendable<D>, const D: usize>(
    partial_witness: &mut PartialWitness<F>,
    input_email: &String,
    target: &EmailTarget,
) {
    let EmailTarget {
        input_email_in_bits: input_email_in_bits_target,
        is_verified: is_verified_target,
    } = target;

    assert_eq!(input_email.len() * 8, input_email_in_bits_target.len());

    let input_email_in_bytes = input_email.as_bytes();
    let input_email_in_bits = array_to_bits(input_email_in_bytes);

    for i in 0..input_email_in_bits.len() {
        partial_witness.set_bool_target(input_email_in_bits_target[i], input_email_in_bits[i]);
    }
}

pub fn array_to_bits(bytes: &[u8]) -> Vec<bool> {
    let len = bytes.len();
    let mut ret = Vec::new();
    for i in 0..len {
        for j in 0..8 {
            let b = (bytes[i] >> (7 - j)) & 1;
            ret.push(b == 1);
        }
    }
    ret
}
