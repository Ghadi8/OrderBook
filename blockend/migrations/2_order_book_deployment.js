const OrderBookCont = artifacts.require("OrderBook");

const { setEnvValue } = require("../utils/env-man");

const conf = require("../migration-parameters");

const setOrderBook = (n, v) => {
  setEnvValue("../", `OrderBook_ADDRESS_${n.toUpperCase()}`, v);
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

  // deploy OrderBook
  await deployer.deploy(OrderBookCont);

  const OrderBook = await OrderBookCont.deployed();

  if (OrderBook) {
    console.log(
      `Deployed: OrderBook
       network: ${network}
       address: ${OrderBook.address}
       creator: ${accounts[0]}
    `
    );
    setOrderBook(network, OrderBook.address);
  } else {
    console.log("OrderBook Deployment UNSUCCESSFUL");
  }
};
