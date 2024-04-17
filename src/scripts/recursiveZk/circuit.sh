#!/bin/sh
set -e

# --------------------------------------------------------------------------------
# Phase 2
# ... circuit-specific stuff

# if zkr/zkey does not exist, make folder
[ -d zkr/zkey ] || mkdir zkr/zkey

# Compile circuits
circom src/user/services/zeroKnowledgeCircuits/zkServices/circuit/recursiveVerification.circom -o zkr/ --r1cs --wasm

#Setup
snarkjs groth16 setup zkr/recursiveVerification.r1cs zkr/ptau/pot8_final.ptau zkr/zkey/recursiveVerification_final.zkey

# # Generate reference zkey
snarkjs zkey new zkr/recursiveVerification.r1cs zkr/ptau/pot8_final.ptau zkr/zkey/recursiveVerification_0000.zkey

# # Ceremony just like before but for zkey this time
snarkjs zkey contribute zkr/zkey/recursiveVerification_0000.zkey zkr/zkey/recursiveVerification_0001.zkey \
    --name="First recursiveVerification contribution" -v -e="$(head -n 4096 /dev/urandom | openssl sha1)"
snarkjs zkey contribute zkr/zkey/recursiveVerification_0001.zkey zkr/zkey/recursiveVerification_0002.zkey \
    --name="Second recursiveVerification contribution" -v -e="$(head -n 4096 /dev/urandom | openssl sha1)"
snarkjs zkey contribute zkr/zkey/recursiveVerification_0002.zkey zkr/zkey/recursiveVerification_0003.zkey \
    --name="Third recursiveVerification contribution" -v -e="$(head -n 4096 /dev/urandom | openssl sha1)"

# #  Verify zkey
snarkjs zkey verify zkr/recursiveVerification.r1cs zkr/ptau/pot8_final.ptau zkr/zkey/recursiveVerification_0003.zkey

# # Apply random beacon as before
snarkjs zkey beacon zkr/zkey/recursiveVerification_0003.zkey zkr/zkey/recursiveVerification_final.zkey \
    0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="RecursiveVerification FinalBeacon phase2"

# # Optional: verify final zkey
snarkjs zkey verify zkr/recursiveVerification.r1cs zkr/ptau/pot8_final.ptau zkr/zkey/recursiveVerification_final.zkey

# # Export verification key
snarkjs zkey export verificationkey zkr/zkey/recursiveVerification_final.zkey zkr/recursiveVerification_verification_key.json

# Export recursiveVerification verifier with updated name and solidity version
snarkjs zkey export solidityverifier zkr/zkey/recursiveVerification_final.zkey src/user/services/zeroKnowledgeCircuits/zkServices/contracts/RecursiveVerificationVerifier.sol
# sed -i'.bak' 's/0.6.11;/0.8.11;/g' contracts/RecursiveVerificationVerifier.sol
sed -i'.bak' 's/contract Verifier/contract RecursiveVerificationVerifier/g' src/user/services/zeroKnowledgeCircuits/zkServices/contracts/RecursiveVerificationVerifier.sol

rm src/user/services/zeroKnowledgeCircuits/zkServices/contracts/*.bak