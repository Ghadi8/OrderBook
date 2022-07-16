const AssetCont1 = artifacts.require("Asset1");

const { setEnvValue } = require("../utils/env-man");

const conf = require("../migration-parameters");

const setAsset1 = (n, v) => {
  setEnvValue("../", `Asset1_ADDRESS_${n.toUpperCase()}`, v);
};

module.exports = async (deployer, network, accounts) => {
  switch (network) {
    case "rinkeby":
      c = { ...conf.rinkeby };
      break;
    case "mainnet":
      c = { ...conf.mainnet };
      break;
    case "development":
    default:
      c = { ...conf.devnet };
  }

  // deploy Asset
  await deployer.deploy(
    AssetCont1,
    c.asset1.name,
    c.asset1.symbol,
    c.asset1.initialSupply
  );

  const Asset1 = await AssetCont1.deployed();

  if (Asset1) {
    console.log(
      `Deployed: Asset1
       network: ${network}
       address: ${Asset1.address}
       creator: ${accounts[0]}
    `
    );
    setAsset1(network, Asset1.address);
  } else {
    console.log("Asset1 Deployment UNSUCCESSFUL");
  }
};
