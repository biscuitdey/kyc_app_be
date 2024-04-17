#![allow(clippy::upper_case_acronyms)]
#![allow(incomplete_features)]

use plonky2::field::extension::Extendable;
use plonky2::hash::hash_types::RichField;
use plonky2::iop::target::BoolTarget;
use plonky2::iop::witness::{PartialWitness, WitnessWrite};
use plonky2::plonk::circuit_builder::CircuitBuilder;
use plonky2::plonk::circuit_data::{CircuitConfig, CommonCircuitData, VerifierOnlyCircuitData};
use plonky2::plonk::config::{AlgebraicHasher, GenericConfig};
use plonky2::plonk::proof::ProofWithPublicInputs;
use std::panic::{catch_unwind, AssertUnwindSafe};

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
    stored_email: &String,
    input_email: &String,
) -> ProofTuple<F, C, D> {
    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F, D>::new(config);

    //Assuming that both the input email is the same length as the stored email
    let stored_email_length = stored_email.len();
    let email_target =
        make_is_email_exists_circuit(&mut builder, stored_email_length, stored_email);

    //Stored on IPFS
    let mut partial_witness = PartialWitness::new();
    fill_is_email_exists_circuit(&mut partial_witness, input_email, &email_target);

    //Build the circuit
    let data = builder.build::<C>();
    let proof = data.prove(partial_witness).unwrap();

    ProofTuple {
        proof,
        vd: data.verifier_only,
        cd: data.common,
    }
}

pub fn verify_and_merge_email_exists_proof<
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F>,
    const D: usize,
>(
    email: &String,
    proof: &mut ProofTuple<F, C, D>,
) -> bool
where
    C::Hasher: AlgebraicHasher<F>,
{
    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F, D>::new(config);
    let mut pw = PartialWitness::new();

    //1. GENERATE NEW EMAIL PROOF

    //2. VERIFY AND MERGE WITH OLD PROOF
    //Proof with appropriate inputs
    //Verify proof with different public inputs
    let verification_input_email: String = email.to_owned();
    let verification_input_email_in_bytes: &[u8] = verification_input_email.as_bytes();
    let verification_input_email_in_bits = array_to_bits(verification_input_email_in_bytes);

    for i in 0..proof.proof.public_inputs.len() - 1 {
        proof.proof.public_inputs[i] = F::from_bool(verification_input_email_in_bits[i]);
    }

    let pt = builder.add_virtual_proof_with_pis(&proof.cd);

    let vdt = builder.add_virtual_verifier_data(proof.cd.config.fri_config.cap_height);

    builder.verify_proof::<C>(&pt, &vdt, &proof.cd);

    pw.set_proof_with_pis_target(&pt, &proof.proof);
    pw.set_verifier_data_target::<C, D>(&vdt, &proof.vd);

    let data = builder.build::<C>();

    let result = catch_unwind(AssertUnwindSafe(|| data.prove(pw)));

    if result.is_ok() {
        let is_verified = data.verify(result.unwrap().unwrap());
        println!("Ok: {}", is_verified.is_ok());
        return is_verified.is_ok();
    } else {
        println!("Error: {}", result.is_err());
        return result.is_ok();
    }
}

pub fn make_is_email_exists_circuit<F: RichField + Extendable<D>, const D: usize>(
    builder: &mut CircuitBuilder<F, D>,
    input_email_length: usize,
    stored_email: &String,
) -> EmailTarget {
    //1. STORED EMAIL AS STORED VALUE
    //Convert stored email into bits

    let stored_email_in_bytes = stored_email.as_bytes();
    let stored_email_in_bits = array_to_bits(stored_email_in_bytes);

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
        let x = builder.constant_bool(stored_email_in_bits[i]).target;
        let y = input_email_in_bits[i].target;

        let result = builder.is_equal(x, y);

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
        is_verified: _is_verified_target,
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
