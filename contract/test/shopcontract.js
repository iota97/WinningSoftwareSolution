const ShopContract = artifacts.require("ShopContract");

contract("ShopContract", async accounts => {

    const testPrice = 5; // 0.05 USD
    const slippage = 0.5;

    it("Adding payment entry", async () => {

        const contract = await ShopContract.deployed();

        const jsonAddedPayment = await contract.addPaymentEntry(testPrice);
        const paymentEntryId = jsonAddedPayment.logs[0].args.paymentEntryId.toNumber();

        assert.equal(paymentEntryId, 0, "Error on adding payment entry.");

    });

    it("Getting payment entry", async () => {

        const contract = await ShopContract.deployed();

        const jsonGetPayment = await contract.getPaymentEntry(0);
        const resultPrice = jsonGetPayment.price;
        const resultSeller = jsonGetPayment.seller;

        const isCorrect = resultPrice == testPrice && resultSeller == accounts[0];

        assert.equal(isCorrect, true, "Error on getting payment entry.")

    });

    it("Settling payment", async () => {

        const contract = await ShopContract.deployed();

        const addr = "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada";
        const aggregatorV3InterfaceABI = [{ "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "description", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint80", "name": "_roundId", "type": "uint80" }], "name": "getRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "latestRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }];

        const priceFeed = new web3.eth.Contract(aggregatorV3InterfaceABI, addr);
        const rec = await priceFeed.methods.latestRoundData().call();

        const valueToSend = ((10**24)/rec.answer) * testPrice; //in wei

        const jsonSettledPayment = await contract.settlePayment(0, {value: valueToSend + Number(((valueToSend*slippage)/100).toFixed(0))}); //this can't be the best way to do it
        const paymentSettledId = jsonSettledPayment.logs[0].args.settledPaymentId.toNumber();

        assert.equal(paymentSettledId, 0, "Error on settling payment entry.");

    });

});