const ShopContract = artifacts.require("ShopContract");

contract("ShopContract", async accounts => {

    it("Adding payment entry", async () => {

        const contract = await ShopContract.deployed();

        const result = await contract.addPaymentEntry(1000000);

        const paymentEntryId = result.logs[0].args.paymentEntryId.toNumber();

        assert.equal(paymentEntryId, 0, "Error on adding payment entry");

    });

});