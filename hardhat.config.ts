import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-ethers';
import '@nomicfoundation/hardhat-toolbox';
import 'dotenv/config';

const config: HardhatUserConfig = {
  defaultNetwork: 'goerli',
  networks: {
    goerli: {
      url: `${process.env.ALCHEMY_URL}`,
    },
  },
  solidity: {
    version: '0.6.11',
  },
  paths: {
    sources:
      './src/bri/zeroKnowledgeProof/services/blockchain/ethereum/contracts',
    artifacts:
      './src/bri/zeroKnowledgeProof/services/blockchain/ethereum/artifacts/artifacts',
  },
};

export default config;
