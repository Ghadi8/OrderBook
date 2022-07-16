const AssetCont2 = artifacts.require("Asset2");

const { setEnvValue } = require("../utils/env-man");

const conf = require("../migration-parameters");

const setAsset2 = (n, v) => {
  setEnvValue("../", `Asset2_ADDRESS_${n.toUpperCase()}`, v);
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
    AssetCont2,
    c.asset2.name,
    c.asset2.symbol,
    c.asset2.initialSupply
  );

  const Asset2 = await AssetCont2.deployed();

  if (Asset2) {
    console.log(
      `Deployed: Asset2
       network: ${network}
       address: ${Asset2.address}
       creator: ${accounts[0]}
    `
    );
    setAsset2(network, Asset2.address);
  } else {
    console.log("Asset2 Deployment UNSUCCESSFUL");
  }
};
