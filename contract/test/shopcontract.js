const ShopContract = artifacts.require("ShopContract");

contract("ShopContract", async accounts => {

    before(async function(){
        contract = await ShopContract.new(2, 5, 5, 5, 400, 2, 10, "0x4645895DE6761C3c221Da5f6D75e4393a868B4a0");
    });


    const testPrice = 5; // 0.05 USD

    const addr = "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada";
    const aggregatorV3InterfaceABI = [{ "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "description", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint80", "name": "_roundId", "type": "uint80" }], "name": "getRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "latestRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }];

    it("Reverting adding wrong payment entry", async () => {

        let reverted = false;

        try {
            await contract.addPaymentEntry(0);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.");

    });

    it("Adding payment entry", async () => {

        const jsonAddedPayment = await contract.addPaymentEntry(testPrice);
        const paymentEntryId = jsonAddedPayment.logs[0].args.paymentEntryId.toNumber();

        assert.equal(paymentEntryId, 0, "Error on adding payment entry.");

    });

    it("Reverting getting payment entry", async () => {

        let reverted = false;

        try {
            await contract.getPaymentEntry(99);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.");

    });

    it("Getting payment entry", async () => {

        const jsonGetPayment = await contract.getPaymentEntry(0);

        const resultPrice = jsonGetPayment.price;
        const resultSeller = jsonGetPayment.seller;

        const isCorrect = resultPrice == testPrice && resultSeller == accounts[0];

        assert.equal(isCorrect, true, "Error on getting payment entry.")

    });

    it("Reverting settling payment: wrong payment id", async () => {

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

        const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr);
        const rec = await priceFeed.methods.latestRoundData().call();

        const valueToSend = ((10**24)/rec.answer) * testPrice; //in wei

        const jsonSettledPayment = await contract.settlePayment(0, {value: valueToSend});
        const paymentSettledId = jsonSettledPayment.logs[0].args.settledPaymentId.toNumber();

        assert.equal(paymentSettledId, 0, "Error on settling payment entry.");

    });

    it("Reverting getting settled payment", async () => {

        let reverted = false;

        try {
            await contract.getSettledPayment(99);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Getting settled payment", async () => {

        const jsonGetPayment = await contract.getSettledPayment(0);
        const resultPaymentEntryId = jsonGetPayment.paymentEntryId;
        const resultStatus = jsonGetPayment.status;
        const resultClient = jsonGetPayment.client;

        const isCorrect = resultPaymentEntryId == 0 && resultClient == accounts[0] && resultStatus == 1;

        assert.equal(isCorrect, true, "Error on getting settled payment.")

    });

    it("Unlocking funds", async () => {

        const jsonUnlockedPayment = await contract.unlockFunds(0);
        const unlockedPaymentId = jsonUnlockedPayment.logs[0].args.settledPaymentId.toNumber();

        assert.equal(unlockedPaymentId, 0, "Error on unlocking funds.");

    });

    it("Reverting unlocking funds: wrong sender", async () => {

        let reverted = false;

        try {
            await contract.unlockFunds(0, {from: accounts[1]});
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Reverting unlocking funds: wrong payment status", async () => {

        let reverted = false;

        try {
            await contract.unlockFunds(0);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Reverting unlocking funds: out of bounds transaction id", async () => {

        let reverted = false;

        try {
            await contract.unlockFunds(99);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Cancelling payment", async () => {

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

        let reverted = false;

        try {
            await contract.cancelPayment(1);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Reverting cancelling payment: out of bounds transaction id", async () => {

        let reverted = false;

        try {
            await contract.cancelPayment(99);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Reverting expired payment manually" , async () => {

        const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr);
        const rec = await priceFeed.methods.latestRoundData().call();

        const valueToSend = ((10**24)/rec.answer) * testPrice; //in wei

        const jsonSettledPayment = await contract.settlePayment(0, {value: valueToSend});
        const paymentSettledId = jsonSettledPayment.logs[0].args.settledPaymentId.toNumber();

        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(6000);

        const jsonRevertedPayment = await contract.revertPayment(paymentSettledId);
        const revertedPaymentSettledId = jsonRevertedPayment.logs[0].args.settledPaymentId.toNumber();

        assert.equal(revertedPaymentSettledId, paymentSettledId, "Payment not reverted");

    });

    it("Reverting malicious manual reverting expired payment: payment not expired" , async () => {

        const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr);
        const rec = await priceFeed.methods.latestRoundData().call();

        const valueToSend = ((10**24)/rec.answer) * testPrice; //in wei

        const jsonSettledPayment = await contract.settlePayment(0, {value: valueToSend});
        const paymentSettledId = jsonSettledPayment.logs[0].args.settledPaymentId.toNumber();

        let reverted = false;

        try {
            await contract.revertPayment(paymentSettledId);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Reverting malicious manual reverting expired payment: out of bounds payment id" , async () => {

        const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr);
        const rec = await priceFeed.methods.latestRoundData().call();

        const valueToSend = ((10**24)/rec.answer) * testPrice; //in wei

        const jsonSettledPayment = await contract.settlePayment(0, {value: valueToSend});
        const paymentSettledId = jsonSettledPayment.logs[0].args.settledPaymentId.toNumber();

        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(6000);

        let reverted = false;

        try {
            await contract.revertPayment(99);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Reverting malicious manual reverting expired payment: wrong address" , async () => {

        const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr);
        const rec = await priceFeed.methods.latestRoundData().call();

        const valueToSend = ((10**24)/rec.answer) * testPrice; //in wei

        const jsonSettledPayment = await contract.settlePayment(0, {value: valueToSend});
        const paymentSettledId = jsonSettledPayment.logs[0].args.settledPaymentId.toNumber();

        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(6000);

        let reverted = false;

        try {
            await contract.revertPayment(paymentSettledId, {from:accounts[5]});
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Reverting malicious manual reverting expired payment: wrong status" , async () => {

        let reverted = false;

        try {
            await contract.revertPayment(3);
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.")

    });

    it("Checking upkeep needed", async () => {

        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(6000);

        const jsonUpkeep = await contract.checkUpkeep(0);
        assert(jsonUpkeep.upkeepNeeded, true, "Upkeep not needed");

    });

    it("Performing upkeep (without exceeding batch size)", async () => {

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

            assert(status, 3, "Transaction was not reverted.");

        }else{
            assert.fail("Upkeep is not needed (but it should have been).");
        }

    });

    it("Performing upkeep (exceeding batch size)", async () => {

        const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr);
        const rec = await priceFeed.methods.latestRoundData().call();

        const valueToSend = ((10**24)/rec.answer) * testPrice; //in wei

        const jsonSettledPayment = await contract.settlePayment(0, {value: valueToSend});
        const paymentSettledId = jsonSettledPayment.logs[0].args.settledPaymentId.toNumber();
        test = await contract.settlePayment(0, {value: valueToSend});
        testresult = test.logs[0].args.settledPaymentId.toNumber();
        test2 = await contract.settlePayment(0, {value: valueToSend});
        test2result = test2.logs[0].args.settledPaymentId.toNumber();

        const delay = ms => new Promise(res => setTimeout(res, ms));
        await delay(6000);

        const jsonUpkeep = await contract.checkUpkeep(0);

        if(jsonUpkeep.upkeepNeeded){

            const jsonUpkeep = await contract.performUpkeep(0);
            const jsonGetPayment = await contract.getSettledPayment(test2result);
            const status = jsonGetPayment.status;

            assert(status, 2, "Out-of-batch transaction was processed.");

        }else{
            assert.fail("Upkeep is not needed (but it should have been).");
        }

    });

    it("Reverting performing upkeep", async () => {

        let reverted = false;

        try{
            await contract.performUpkeep(0); //performs upkeep first time
        }catch(error){}

        try {
            await contract.performUpkeep(0); //this should fail
        }catch (error) {
            reverted = true;
        }

        assert.equal(reverted, true, "Not reverted.");

    });

});