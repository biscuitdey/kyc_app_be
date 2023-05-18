#!/bin/sh
set -e

# --------------------------------------------------------------------------------
# Phase 2
# ... circuit-specific stuff

# if zk/zkey does not exist, make folder
[ -d zk/zkey ] || mkdir zk/zkey

# Compile circuits
circom src/user/services/zeroKnowledgeCircuits/zkServices/circuit/phoneNumber.circom -o zk/ --r1cs --wasm

#Setup
snarkjs groth16 setup zk/phoneNumber.r1cs zk/ptau/pot8_final.ptau zk/zkey/phoneNumber_final.zkey

# # Generate reference zkey
snarkjs zkey new zk/phoneNumber.r1cs zk/ptau/pot8_final.ptau zk/zkey/phoneNumber_0000.zkey

# # Ceremony just like before but for zkey this time
snarkjs zkey contribute zk/zkey/phoneNumber_0000.zkey zk/zkey/phoneNumber_0001.zkey \
    --name="First phoneNumber contribution" -v -e="$(head -n 4096 /dev/urandom | openssl sha1)"
snarkjs zkey contribute zk/zkey/phoneNumber_0001.zkey zk/zkey/phoneNumber_0002.zkey \
    --name="Second phoneNumber contribution" -v -e="$(head -n 4096 /dev/urandom | openssl sha1)"
snarkjs zkey contribute zk/zkey/phoneNumber_0002.zkey zk/zkey/phoneNumber_0003.zkey \
    --name="Third phoneNumber contribution" -v -e="$(head -n 4096 /dev/urandom | openssl sha1)"

# #  Verify zkey
snarkjs zkey verify zk/phoneNumber.r1cs zk/ptau/pot8_final.ptau zk/zkey/phoneNumber_0003.zkey

# # Apply random beacon as before
snarkjs zkey beacon zk/zkey/phoneNumber_0003.zkey zk/zkey/phoneNumber_final.zkey \
    0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f 10 -n="PhoneNumber FinalBeacon phase2"

# # Optional: verify final zkey
snarkjs zkey verify zk/phoneNumber.r1cs zk/ptau/pot8_final.ptau zk/zkey/phoneNumber_final.zkey

# # Export verification key
snarkjs zkey export verificationkey zk/zkey/phoneNumber_final.zkey zk/phoneNumber_verification_key.json

# Export phoneNumber verifier with updated name and solidity version
snarkjs zkey export solidityverifier zk/zkey/phoneNumber_final.zkey src/user/services/zeroKnowledgeCircuits/zkServices/contracts/PhoneNumberVerifier.sol
# sed -i'.bak' 's/0.6.11;/0.8.11;/g' contracts/PhoneNumberVerifier.sol
sed -i'.bak' 's/contract Verifier/contract PhoneNumberVerifier/g' src/user/services/zeroKnowledgeCircuits/zkServices/contracts/PhoneNumberVerifier.sol

rm src/user/services/zeroKnowledgeCircuits/zkServices/contracts/*.bak