#!/bin/sh
set -e

# --------------------------------------------------------------------------------
# Phase 1
# ... non-circuit-specific stuff

# make ptau folder
[ -d zkr/ptau ] || mkdir zkr/ptau

# Starts Powers Of Tau ceremony, creating the file pot14_0000.ptau
snarkjs powersoftau new bn128 14 zkr/ptau/pot14_0000.ptau -v

# Contribute to ceremony a few times...
# As we want this to be non-interactive we'll just write something random-ish for entropy
snarkjs powersoftau contribute zkr/ptau/pot14_0000.ptau zkr/ptau/pot14_0001.ptau \
    --name="First contribution" -v -e="$(head -n 4096 /dev/urandom | openssl sha1)"
snarkjs powersoftau contribute zkr/ptau/pot14_0001.ptau zkr/ptau/pot14_0002.ptau \
    --name="Second contribution" -v -e="$(head -n 4096 /dev/urandom | openssl sha1)"
snarkjs powersoftau contribute zkr/ptau/pot14_0002.ptau zkr/ptau/pot14_0003.ptau \
    --name="Third contribution" -v -e="$(head -n 4096 /dev/urandom | openssl sha1)"

# Verify
snarkjs powersoftau verify zkr/ptau/pot14_0003.ptau

# Apply random beacon to finalised this phase of the setup.
# For more information about random beacons see here: https://eprint.iacr.org/2017/1050.pdf
# For the purposes, the beacon is essentially a delayed hash function evaluated on 0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f
# (in practice this value will be some form of high entropy and publicly available data of your choice)
snarkjs powersoftau beacon zkr/ptau/pot14_0003.ptau zkr/ptau/pot14_beacon.ptau \
    0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="Final Beacon"

# Prepare phase 2...
# Under the hood, the prepare phase2 command calculates the encrypted evaluation of the Lagrange polynomials at tau for
# tau, alpha*tau and beta*tau. It takes the beacon ptau file we generated in the previous step, and outputs a final pta
# file which will be used to generate the circuit proving and verification keys.
snarkjs powersoftau prepare phase2 zkr/ptau/pot14_beacon.ptau zkr/ptau/pot14_final.ptau -v

# Verify the final ptau file. Creates the file pot14_final.ptau
snarkjs powersoftau verify zkr/ptau/pot14_final.ptau