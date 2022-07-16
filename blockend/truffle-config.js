const HDWalletProvider = require("@truffle/hdwallet-provider");
const fs = require("fs");

const infuraKey = "7b228409b36d4a2989d11e9779a6dd5c";

const key_TESTNET = fs.readFileSync(".test.secret").toString().trim();
const key_MAINNET = fs.readFileSync(".main.secret").toString().trim();
const key_ENERGI = fs.readFileSync(".energi.secret").toString().trim();
module.exports = {
  contracts_build_directory: "./abis",
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      gas: 6700000,
      gasPrice: 80000000000, // 80
      network_id: "*",
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider({
          privateKeys: [key_TESTNET],
          providerOrUrl: `wss://rinkeby.infura.io/ws/v3/${infuraKey}`,
        }),
      network_id: 4,
      gas: 7500000,
      confirmations: 1,
      gasPrice: 100000000000, // 100
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    mainnet: {
      provider: () =>
        new HDWalletProvider({
          privateKeys: [key_MAINNET],
          providerOrUrl: `wss://mainnet.infura.io/ws/v3/${infuraKey}`,
        }),
      network_id: 1,
      gas: 5500000,
      gasPrice: 75000000000, // 75
      confirmations: 1,
      timeoutBlocks: 400,
      skipDryRun: true,
    },
    energi: {
      provider: () =>
        new HDWalletProvider({
          privateKeys: [key_ENERGI],
          providerOrUrl: `https://nodeapi.test.energi.network/`,
        }),
      network_id: 49797,
      gas: 6000000,
      gasPrice: 100000000000, // 100
      confirmations: 1,
      timeoutBlocks: 400,
      skipDryRun: true,
      verify: {
        apiUrl: "https://explorer.test.energi.network/api",
      },
    },
  },
  mocha: {},
  plugins: ["truffle-plugin-verify"],
  api_keys: {
    etherscan: "DE3V68DDU5KKG9VGM65BNECUPKEH7Q6A6G",
  },
  compilers: {
    solc: {
      version: "0.8",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
  db: {
    enabled: false,
  },
};
