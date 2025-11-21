import { config as dotenvConfig } from "dotenv";

dotenvConfig();

/** @type import('hardhat/config').HardhatUserConfig */
const hardhatConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hedera_testnet: {
      url: "https://testnet.hashio.io/api",
      accounts: process.env.HEDERA_PRIVATE_KEY ? [process.env.HEDERA_PRIVATE_KEY] : [],
      chainId: 296,
      gasLimit: 3000000,
      gasPrice: 10000000000, // 10 Gwei
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default hardhatConfig;