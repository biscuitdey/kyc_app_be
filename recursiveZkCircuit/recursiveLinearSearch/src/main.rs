#![allow(clippy::upper_case_acronyms)]
#![allow(incomplete_features)]
#![feature(generic_const_exprs)]

mod is_email_exists_circuit;

use anyhow::{Error, Result};
use is_email_exists_circuit::{
    array_to_bits, generate_is_email_exists_proof, verify_is_email_exists_proof, ProofTuple,
};
use plonky2::field::extension::Extendable;
use plonky2::field::types::Field;
use plonky2::hash::hash_types::RichField;
use plonky2::iop::target::BoolTarget;
use plonky2::iop::witness::{PartialWitness, WitnessWrite};
use plonky2::plonk::circuit_builder::CircuitBuilder;
use plonky2::plonk::circuit_data::{
    CircuitConfig, CommonCircuitData, VerifierCircuitTarget, VerifierOnlyCircuitData,
};
use plonky2::plonk::config::{AlgebraicHasher, GenericConfig, PoseidonGoldilocksConfig};
use plonky2::plonk::proof::{CompressedProofWithPublicInputs, ProofWithPublicInputs};

// //TODO: Add recursion when new item added to list
fn main() -> Result<()> {
    //public input email
    //check with stored variable
    const D: usize = 2;
    type C = PoseidonGoldilocksConfig;
    type F = <C as GenericConfig<D>>::F;

    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F, D>::new(config);

    let mut pw = PartialWitness::new();

    let list = Vec::new();

    let is_verified = list.contains(&"test");

    let target = builder.add_virtual_target();
    builder.register_public_input(target);

    if is_verified {
        pw.set_target(target, F::ONE)
    } else {
        pw.set_target(target, F::ZERO)
    }

    Ok(())
}

pub fn merge_proof_and_store_new_email<
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F>,
    const D: usize,
>(
    stored_email_proof: &mut ProofTuple<F, C, D>,
    input_email: String,
) {
    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F, D>::new(config);

    //Set input email as the proof public input
    let verification_input_email: String = input_email.to_owned();
    let verification_input_email_in_bytes: &[u8] = verification_input_email.as_bytes();
    let verification_input_email_in_bits = array_to_bits(verification_input_email_in_bytes);

    for i in 0..stored_email_proof.proof.public_inputs.len() {
        stored_email_proof.proof.public_inputs[i] =
            F::from_bool(verification_input_email_in_bits[i]);
    }

    let email_proof_tuple: ProofTuple<F, C, D> =
        generate_is_email_exists_proof(&stored_email, &input_email);

    //VERIFICATION RESULT
    //1. TRUE
    //2. FALSE

    //Merge old proof target + new target and create a new Target
}

pub fn recursive_proof_tree<
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F>,
    const D: usize,
    const B: usize,
    const DEPTH: usize,
>(
    email: String,
    stored_email_proof: ProofTuple<F, C, D>,
) -> bool
where
    C::Hasher: AlgebraicHasher<F>,
{
    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F, D>::new(config);

    //1. Get Proof
    //Get proof from IPFS using node service
    //If { no cid stored --> directly call generate proof}
    //else call the recursive proof tree
    let mut proof = stored_email_proof;

    //2. Verify Proof
    let is_verified = verify_is_email_exists_proof(&email, &mut proof);

    //3. If True - return "isFraud"
    if is_verified {
        return true;
    } else {
        //4. If False -
        //generate new proof
        //Merge with old proof
        //Store new proof
        let input_email = email.clone();

        merge_proof_and_store_new_email(&mut proof, input_email);

        return false;
    }
}

// // //BASE PROOF

// // //If email exists in the stored variable, true for proof //else regenerate new proof

// // //RECURSIVE PROOF --> Combine 2 proofs where the public input of left_proof is also another public input of right_proof.

// // //RECURSIVE TREE --> If email in the current proof, true, else {create a proof with email, combine both the proof using the RECURSIVE PROOF, store the combined proof}
