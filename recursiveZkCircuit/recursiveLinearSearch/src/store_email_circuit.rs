#![allow(clippy::upper_case_acronyms)]
#![allow(incomplete_features)]

use anyhow::{Error, Result};
use plonky2::field::extension::Extendable;
use plonky2::hash::hash_types::RichField;
use plonky2::iop::target::{BoolTarget, Target};
use plonky2::iop::witness::{PartialWitness, WitnessWrite};
use plonky2::plonk::circuit_builder::CircuitBuilder;
use plonky2::plonk::circuit_data::{CircuitConfig, CommonCircuitData, VerifierOnlyCircuitData};
use plonky2::plonk::config::GenericConfig;
use plonky2::plonk::proof::ProofWithPublicInputs;

pub struct StoreTargets {
    pub email: Vec<BoolTarget>,
    pub store: Vec<Vec<Target>>,
}

pub struct ProofTuple<F: RichField + Extendable<D>, C: GenericConfig<D, F = F>, const D: usize> {
    proof: Result<ProofWithPublicInputs<F, C, D>, Error>,
    vd: VerifierOnlyCircuitData<C, D>,
    cd: CommonCircuitData<F, D>,
}

pub fn store_email_proof<
    F: RichField + Extendable<D>,
    C: GenericConfig<D, F = F>,
    const D: usize,
>(
    email: &[u8],
) -> ProofTuple<F, C, D> {
    let config = CircuitConfig::standard_recursion_config();
    let mut builder = CircuitBuilder::<F, D>::new(config);

    //Create Circuit and fill the targets
    let target = make_new_email_store_circuit(&mut builder, email_to_be_stored.len());
    let mut partial_witness = PartialWitness::new();
    fill_new_email_store_circuit(&mut partial_witness, email_to_be_stored, &target);

    //Build the circuit
    let data = builder.build::<C>();

    let proof = data.prove(partial_witness);

    ProofTuple {
        proof: proof,
        vd: data.verifier_only,
        cd: data.common,
    }
}

pub fn make_store_new_email_circuit<F: RichField + Extendable<D>, const D: usize>(
    builder: &mut CircuitBuilder<F, D>,
    email_length: usize,
    store_length: usize,
) -> StoreTargets {
    //Get email length in bits
    let email_length_in_bits = email_length * 8;

    //Add targets for the emails
    let mut email = Vec::new();
    let mut email_non_boolean = Vec::new();
    let mut store: Vec<Vec<Target>> = Vec::new();

    for _ in 0..email_length_in_bits {
        let boolean_target = builder.add_virtual_bool_target_unsafe();
        builder.register_public_input(boolean_target.target);
        email.push(boolean_target);
        email_non_boolean.push(boolean_target.target)
    }

    let store_target = builder.add_virtual_targets(store_length);
    builder.register_public_inputs(&store_target);

    store.push(email_non_boolean);

    return StoreTargets { email, store };
}

pub fn fill_store_new_email_circuit<F: RichField + Extendable<D>, const D: usize>(
    partial_witness: &mut PartialWitness<F>,
    email: &[u8],
    store: Vec<Vec<Target>>,
    targets: &StoreTargets,
) {
    let StoreTargets {
        email: email_target,
        store: store_target,
    } = targets;

    assert_eq!(email.len() * 8, email_target.len());

    let email_in_bits = array_to_bits(email);

    for i in 0..email_in_bits.len() {
        partial_witness.set_bool_target(email_target[i], email_in_bits[i]);
    }

    //TODO: Resolve using virtual circuits ---> When merging 2 proofs --> Convert target to F field value.

    for i in 0..store.len() {
        for j in 0..store[i].len() {
            partial_witness.set_target(store_target[i][j], store[i][j]);
        }
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
