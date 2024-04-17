#![feature(result_option_inspect)]
use std::panic::{catch_unwind, AssertUnwindSafe};

use anyhow::Result;
use plonky2::hash::hash_types::RichField;
use plonky2::iop::witness::{PartialWitness, WitnessWrite};
use plonky2::plonk::circuit_builder::CircuitBuilder;
use plonky2::plonk::circuit_data::{CircuitConfig, CommonCircuitData, VerifierOnlyCircuitData};
use plonky2::plonk::config::{AlgebraicHasher, GenericConfig, PoseidonGoldilocksConfig};
use plonky2::plonk::proof::ProofWithPublicInputs;
use plonky2_field::extension::Extendable;

pub struct ProofTuple<F: RichField + Extendable<D>, C: GenericConfig<D, F = F>, const D: usize> {
    pub proof: ProofWithPublicInputs<F, C, D>,
    pub vd: VerifierOnlyCircuitData<C, D>,
    pub cd: CommonCircuitData<F, D>,
}
fn main() -> Result<()> {
    const D: usize = 2;
    type C = PoseidonGoldilocksConfig;
    type F = <C as GenericConfig<D>>::F;

    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F, D>::new(config);

    //arithmetic circuit

    //Stored email
    let stored_email: String = "om".to_owned();
    let stored_email_in_bytes: &[u8] = stored_email.as_bytes();

    let stored_email_in_bits_length = stored_email_in_bytes.len() * 8;

    let mut stored_email_in_bits_target = Vec::new();

    for _ in 0..stored_email_in_bits_length {
        let bool_target = builder.add_virtual_bool_target_unsafe();
        stored_email_in_bits_target.push(bool_target);
    }

    //Input email
    let input_email: String = "om".to_owned();
    let input_email_in_bytes: &[u8] = input_email.as_bytes();

    let input_email_in_bits_length = input_email_in_bytes.len() * 8;

    let mut input_email_in_bits_target = Vec::new();

    for _ in 0..input_email_in_bits_length {
        let bool_target = builder.add_virtual_bool_target_unsafe();
        input_email_in_bits_target.push(bool_target);
        builder.register_public_input(bool_target.target);
    }

    //3. VERIFY STORED EMAIL === IFPUT EMAIL
    //let mut is_verified = builder.add_virtual_bool_target_unsafe()t;
    let mut is_total = builder._true();
    for i in 0..input_email_in_bits_length {
        let result = builder.is_equal(
            stored_email_in_bits_target[i].target,
            input_email_in_bits_target[i].target,
        );

        is_total = builder.and(result, is_total);
        // builder.register_public_input(is_verified[i]);
    }

    builder.register_public_input(is_total.target);

    //Set the values of the public and private inputs
    let mut pw = PartialWitness::new();

    //Set stored email
    let stored_email_in_bits = array_to_bits(stored_email_in_bytes);
    for i in 0..stored_email_in_bits_length {
        pw.set_bool_target(stored_email_in_bits_target[i], stored_email_in_bits[i]);
    }

    //Set input email
    let input_email_in_bits = array_to_bits(input_email_in_bytes);
    for i in 0..input_email_in_bits_length {
        pw.set_bool_target(input_email_in_bits_target[i], input_email_in_bits[i]);
    }

    let data = builder.build::<C>();

    //Generate proo
    let proof = data.prove(pw)?;

    // let error = data.verify(proof);

    // println!("console log: {}", error.is_ok());

    let verification_email = "mo".to_owned();

    let mut proof_tuple = ProofTuple {
        proof,
        vd: data.verifier_only,
        cd: data.common,
    } as ProofTuple<F, C, D>;

    verify(&mut proof_tuple, &verification_email);

    Ok(())
}

pub fn verify<F: RichField + Extendable<D>, C: GenericConfig<D, F = F>, const D: usize>(
    proof: &mut ProofTuple<F, C, D>,
    email: &String,
) where
    C::Hasher: AlgebraicHasher<F>,
{
    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F, D>::new(config);
    let mut pw = PartialWitness::new();

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
        let r = data.verify(result.unwrap().unwrap());
        println!("Ok: {}", r.is_ok());
    } else {
        println!("Error: {}", result.is_err());
    }

    //let result = data.verify(comb_proof.iter()[0]);

    //println!("console log: {}", result.is_ok());

    //println!("console log error: {}", comb_proof.to_string());

    // if !is_error {
    //     let com_proof = data.prove(pw).unwrap();
    //     let ok: std::result::Result<(), anyhow::Error> = data.verify(com_proof);

    //     println!("console log: {}", ok.is_ok());
    // }
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
