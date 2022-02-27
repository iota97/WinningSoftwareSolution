const ShopContract = artifacts.require("ShopContract");

contract("ShopContract", async accounts => {

    const testPrice = 5; // 0.05 USD

    const addr = "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada";
    const aggregatorV3InterfaceABI = [{ "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "description", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint80", "name": "_roundId", "type": "uint80" }], "name": "getRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "latestRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }];

    it("Reverting adding wrong payment entry", async () => {

        const contract = await ShopContract.deployed();

        let reverted = false;

        try {
            await contract.addPaymentEntry(0);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.");

    });

    it("Adding payment entry", async () => {

        const contract = await ShopContract.deployed();

        const jsonAddedPayment = await contract.addPaymentEntry(testPrice);
        const paymentEntryId = jsonAddedPayment.logs[0].args.paymentEntryId.toNumber();

        assert.equal(paymentEntryId, 0, "Error on adding payment entry.");

    });

    it("Reverting getting payment entry", async () => {

        const contract = await ShopContract.deployed();

        let reverted = false;

        try {
            await contract.getPaymentEntry(99);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.");

    });

    it("Getting payment entry", async () => {

        const contract = await ShopContract.deployed();

        const jsonGetPayment = await contract.getPaymentEntry(0);

        const resultPrice = jsonGetPayment.price;
        const resultSeller = jsonGetPayment.seller;

        const isCorrect = resultPrice == testPrice && resultSeller == accounts[0];

        assert.equal(isCorrect, true, "Error on getting payment entry.")

    });

    it("Reverting settling payment: wrong payment id", async () => {

        const contract = await ShopContract.deployed();

        const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr);
        const rec = await priceFeed.methods.latestRoundData().call();

        const valueToSend = ((10**24)/rec.answer) * testPrice; //in wei

        let reverted = false;

        try {
            await contract.settlePayment(99, {value: valueToSend});
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Reverting settling payment: wrong value", async () => {

        const contract = await ShopContract.deployed();

        const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr);
        const rec = await priceFeed.methods.latestRoundData().call();

        const valueToSend = ((10**24)/rec.answer) * 1; //in wei

        let reverted = false;

        try {
            await contract.settlePayment(0, {value: valueToSend});
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Settling payment", async () => {

        const contract = await ShopContract.deployed();

        const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr);
        const rec = await priceFeed.methods.latestRoundData().call();

        const valueToSend = ((10**24)/rec.answer) * testPrice; //in wei

        const jsonSettledPayment = await contract.settlePayment(0, {value: valueToSend});
        const paymentSettledId = jsonSettledPayment.logs[0].args.settledPaymentId.toNumber();

        assert.equal(paymentSettledId, 0, "Error on settling payment entry.");

    });

    it("Reverting getting settled payment", async () => {

        const contract = await ShopContract.deployed();

        let reverted = false;

        try {
            await contract.getSettledPayment(99);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Getting settled payment", async () => {

        const contract = await ShopContract.deployed();

        const jsonGetPayment = await contract.getSettledPayment(0);
        const resultPaymentEntryId = jsonGetPayment.paymentEntryId;
        const resultStatus = jsonGetPayment.status;
        const resultClient = jsonGetPayment.client;

        const isCorrect = resultPaymentEntryId == 0 && resultClient == accounts[0] && resultStatus == 1;

        assert.equal(isCorrect, true, "Error on getting settled payment.")

    });

    it("Unlocking funds", async () => {

        const contract = await ShopContract.deployed();

        const jsonUnlockedPayment = await contract.unlockFunds(0);
        const unlockedPaymentId = jsonUnlockedPayment.logs[0].args.settledPaymentId.toNumber();

        assert.equal(unlockedPaymentId, 0, "Error on unlocking funds.");

    });

    it("Reverting unlocking funds: wrong sender", async () => {

        const contract = await ShopContract.deployed();

        let reverted = false;

        try {
            await contract.unlockFunds(0, {from: accounts[1]});
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Reverting unlocking funds: wrong payment status", async () => {

        const contract = await ShopContract.deployed();

        let reverted = false;

        try {
            await contract.unlockFunds(0);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Reverting unlocking funds: out of bounds transaction id", async () => {

        const contract = await ShopContract.deployed();

        let reverted = false;

        try {
            await contract.unlockFunds(99);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Cancelling payment", async () => {

        const contract = await ShopContract.deployed();

        const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr);
        const rec = await priceFeed.methods.latestRoundData().call();

        const valueToSend = ((10**24)/rec.answer) * testPrice; //in wei

        const jsonSettledPayment = await contract.settlePayment(0, {value: valueToSend});
        const paymentSettledId = jsonSettledPayment.logs[0].args.settledPaymentId.toNumber();

        const jsonCancelledPayment = await contract.cancelPayment(paymentSettledId);
        const cancelledSettledPaymentId = jsonCancelledPayment.logs[0].args.settledPaymentId.toNumber();

        assert.equal(cancelledSettledPaymentId, 1, "Error on cancelling payment.");

    });


    it("Reverting cancelling payment: wrong sender", async () => {

        const contract = await ShopContract.deployed();

        const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr);
        const rec = await priceFeed.methods.latestRoundData().call();

        const valueToSend = ((10**24)/rec.answer) * testPrice; //in wei

        const jsonSettledPayment = await contract.settlePayment(0, {value: valueToSend});
        const paymentSettledId = jsonSettledPayment.logs[0].args.settledPaymentId.toNumber();

        let reverted = false;

        try {
            await contract.cancelPayment(paymentSettledId, {from: accounts[1]});
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Reverting cancelling payment: wrong payment status", async () => {

        const contract = await ShopContract.deployed();

        let reverted = false;

        try {
            await contract.cancelPayment(1);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Reverting cancelling payment: out of bounds transaction id", async () => {

        const contract = await ShopContract.deployed();

        let reverted = false;

        try {
            await contract.cancelPayment(99);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Checking upkeep needed", async () => {

        const contract = await ShopContract.deployed();

        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(6000);

        const jsonUpkeep = await contract.checkUpkeep(0);
        assert(jsonUpkeep.upkeepNeeded, true, "Upkeep not needed");

    });

    it("Performing upkeep reverting expired transaction", async () => {

        const contract = await ShopContract.deployed();

        const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr);
        const rec = await priceFeed.methods.latestRoundData().call();

        const valueToSend = ((10**24)/rec.answer) * testPrice; //in wei

        const jsonSettledPayment = await contract.settlePayment(0, {value: valueToSend});
        const paymentSettledId = jsonSettledPayment.logs[0].args.settledPaymentId.toNumber();

        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(6000);

        const jsonUpkeep = await contract.checkUpkeep(0);

        if(jsonUpkeep.upkeepNeeded){

            const jsonUpkeep = await contract.performUpkeep(0);
            const jsonGetPayment = await contract.getSettledPayment(paymentSettledId);
            const status = jsonGetPayment.status;

            assert(jsonGetPayment.status, 3, "Transaction was not reverted.");

        }else{
            assert.fail("Upkeep is not needed (but it should have been).");
        }

    });

    it("Reverting performing upkeep", async () => {

        const contract = await ShopContract.deployed();

        let reverted = false;

        try {
            await contract.performUpkeep(0);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.");

    });

});