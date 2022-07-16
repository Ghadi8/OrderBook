/** HELPER FUNCTIONS FOR TESTING SPEC */

/** ethers & BN js lib */
const ethers = require("ethers");
const BN = require("bn.js");

/** private keys map from ganache-generated accounts file */
const { private_keys } = require("../devnet-accounts.json");

/** converting tokens to wei and back for easier assertion/display of numbers */
const toTokens = (w3) => (n) => w3.utils.toWei(n);
const fromTokens = (w3) => (n) => w3.utils.fromWei(n);

/** encoding numbers as uint256 for hashing and signing EIP712 */
const uint256 = (w3) => (n) => w3.eth.abi.encodeParameter("uint256", n);

/** get the current block timestamp to use as deadline
 * basically if a transaction was submitted in block A and by the time
 * it got validated, block A was mined and the transaction values are no
 * longer valid (ie: asset price), therefore the action must be resubmitted
 * based on new values.
 * This way the user will not get returns that didn't match their expectations.
 **/
const getCurrentTime = (w3) => (offset) => {
  return new Promise(function (resolve) {
    w3.eth.getBlock("latest").then(function (block) {
      resolve(block.timestamp + offset);
    });
  });
};

/** converts JS number to BN */
const toBn = (value) => new BN(value);

/**
 * this function checks the TX object logs to find the events
 * that have been triggered by the contract
 **/
const checkEventEmitted = (tx, eventName) =>
  tx.logs.filter((l) => l.event === eventName)[0];

/**
 * Loads network configuration for migrations and tests
 * @param {string} conf
 * @returns configuration object
 */
const loadNetworkConfig = (conf) => ({
  rinkeby: () => {
    return { ...conf.rinkeby };
  },
  mainnet: () => {
    return { ...conf.mainnet };
  },
  development: () => {
    return { ...conf.devnet };
  },
  mumbai: () => {
    return { ...conf.mumbai };
  },
});

/** gets the test account's private key to sign with */
const getAccPrivate = (address) =>
  private_keys[address.toString().toLowerCase()].toString().toLowerCase();

module.exports = (w3) => ({
  toTokens: toTokens(w3),
  fromTokens: fromTokens(w3),
  getCurrentTime: getCurrentTime(w3),
  checkEventEmitted: checkEventEmitted,
  uint256: uint256(w3),
  getAccPrivate: getAccPrivate,
  toBn: toBn,
  loadNetworkConfig: loadNetworkConfig,
});
