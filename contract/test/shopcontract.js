const ShopContract = artifacts.require("ShopContract");

contract("ShopContract", accounts => {

    it("Adding payment entry", () => {

        let contract;

        return ShopContract.deployed()

        .then(instance => {

            contract = instance;

            contract.addPaymentEntry(1000000, {from: accounts[0]})

            .once('confirmation', function(confirmationNumber, receipt) {
                paymentEntryId = receipt.events.addedPaymentEntry.returnValues.paymentEntryId;
                return paymentEntryId;
            })
            .once('error', function(error) {
                return -1;
            });

        })
        .then(entryId => {

            return contract.getPaymentEntry(entryId, {from: accounts[0]});

        })
        .then(paymentEntry => {

            assert.equal(paymentEntry.seller, accounts[0], "error");

        });

    });

});