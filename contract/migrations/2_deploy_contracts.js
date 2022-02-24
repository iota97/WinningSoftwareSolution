const ShopContract = artifacts.require("ShopContract");
module.exports = function(deployer) {
  deployer.deploy(ShopContract);
};
