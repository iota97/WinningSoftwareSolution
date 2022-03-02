const ShopContract = artifacts.require("ShopContract");
module.exports = function(deployer) {
  deployer.deploy(ShopContract, 5, 5, 5, 400, 10, "0x4645895DE6761C3c221Da5f6D75e4393a868B4a0"); 
};
