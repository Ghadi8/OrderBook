const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

// chai assert
const { assert } = chai;

// chai promises
chai.use(chaiAsPromised);

// load contract artifact
const OrderBook = artifacts.require("OrderBook");
const Asset1 = artifacts.require("Asset1");
const Asset2 = artifacts.require("Asset2");

// load migration-parameters
const conf = require("../migration-parameters.js");

contract("OrderBook", ([owner, user1, user2, user3]) => {
  let txStack = [];
  let orderbook;
  let orderbookAddress;
  let asset1;
  let asset2;
  let assetAddress1;
  let assetAddress2;
  const c = conf.devnet;

  it("is deployed", async () => {
    orderbook = await OrderBook.deployed();
    asset1 = await Asset1.deployed();
    asset2 = await Asset2.deployed();
    orderbookAddress = orderbook.address;
    assetAddress1 = asset1.address;
    assetAddress2 = asset2.address;
  });

  it("Asset1: Name is First Token  and symbol is FT1", async () => {
    let name = await asset1.name();
    let symbol = await asset1.symbol();
    assert.equal(name, c.asset1.name);
    assert.equal(symbol, c.asset1.symbol);
  });

  it("Asset2: Name is Second Token and symbol is FT2", async () => {
    let name = await asset2.name();
    let symbol = await asset2.symbol();
    assert.equal(name, c.asset2.name);
    assert.equal(symbol, c.asset2.symbol);
  });

  it("user1 owns tokens from asset1", async () => {
    let tx = await asset1.transfer(user1, 3000, { from: owner });
    let balanceOfUser = await asset1.balanceOf(user1);
    assert.equal(balanceOfUser, 3000);
    txStack.push(tx);
  });

  it("user2 owns tokens from asset2", async () => {
    let tx = await asset2.transfer(user2, 500, { from: owner });
    let balanceOfUser = await asset2.balanceOf(user2);
    assert.equal(balanceOfUser, 500);
    txStack.push(tx);
  });

  it("user1 can create an order", async () => {
    await asset1.approve(orderbookAddress, 3000, { from: user1 });
    let currentBlock = await orderbook.currentBlockNumber();
    let tx = await orderbook.MakeOrder(
      assetAddress1,
      2000,
      assetAddress2,
      300,
      currentBlock + 10,
      { from: user1 }
    );
    let balanceOfUser = await asset1.balanceOf(user1);
    assert.equal(balanceOfUser, 1000);
    txStack.push(tx);
  });

  it("user2 can create an order", async () => {
    await asset2.approve(orderbookAddress, 3000, { from: user2 });
    let currentBlock = await orderbook.currentBlockNumber();
    let tx = await orderbook.MakeOrder(
      assetAddress2,
      200,
      assetAddress1,
      1000,
      currentBlock + 10,
      { from: user2 }
    );
    let balanceOfUser = await asset2.balanceOf(user2);
    assert.equal(balanceOfUser, 300);
    txStack.push(tx);
  });

  it("user2 can cancel the order", async () => {
    let tx = await orderbook.cancelOrder(1, { from: user2 });
    txStack.push(tx);
    let balanceOfUser = await asset2.balanceOf(user2);
    assert.equal(balanceOfUser, 500);
  });

  it("user2 can take order", async () => {
    await asset2.approve(orderbookAddress, 250, { from: user2 });
    let tx = await orderbook.takeOrder(0, 250, { from: user2 });

    // Check user1's balance of asset 1 after filled order
    let balanceOfUser1ofAsset1 = await asset1.balanceOf(user1);
    assert.equal(balanceOfUser1ofAsset1, 1000);

    // Check the remaining balance in contract after partially filled order
    let balanceOfContract = await asset1.balanceOf(orderbookAddress);
    assert.equal(balanceOfContract, 334);

    // Check user1's new balance of asset 2 after filled order
    let balanceOfUser1ofAsset2 = await asset2.balanceOf(user1);
    assert.equal(balanceOfUser1ofAsset2, 250);

    // Check user2's new balance of asset 1 after filled order
    let balanceOfUser2ofAsset1 = await asset1.balanceOf(user2);
    assert.equal(balanceOfUser2ofAsset1, 1666);

    // Check user2's remaining balance of asset 2 after filled order
    let balanceOfUser2ofAsset2 = await asset2.balanceOf(user2);
    assert.equal(balanceOfUser2ofAsset2, 250);

    txStack.push(tx);
  });
});
