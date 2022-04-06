const ShopContract = artifacts.require("ShopContract");
module.exports = function(deployer) {
  deployer.deploy(ShopContract, 1024, 60, 300, 5, 400, 2, 10, "0x4645895DE6761C3c221Da5f6D75e4393a868B4a0"); //1024 batch size, 60sec interval, 300sec expire, 0.5% slippage client, 40% slippage exchange (due to liquidity issues in mumbai), 0.2% slippage DAI, 1% fee to take, address shopchain
};
