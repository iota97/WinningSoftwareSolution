const ShopContract = artifacts.require("ShopContract");
module.exports = function(deployer) {
  deployer.deploy(ShopContract, 5, 5, 5, 400, 2, 10, "0x4645895DE6761C3c221Da5f6D75e4393a868B4a0"); //5sec interval, 5sec expire, 0.5% slippage client, 40% slippage exchange (due to liquidity issues in mumbai), 0.2% slippage DAI, 1% fee to take, address shopchain
};
