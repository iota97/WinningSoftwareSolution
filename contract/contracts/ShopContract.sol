//SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract ShopContract is KeeperCompatibleInterface {

    uint256 private batch;
    uint256 private freePaymentEntryId;
    uint256 private freeSettledPaymentId;

    AggregatorV3Interface internal priceFeedMatic = AggregatorV3Interface(0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada);
    AggregatorV3Interface internal priceFeedDAI = AggregatorV3Interface(0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046);

    uint256 private immutable interval;
    uint256 private immutable expireDuration;
    uint256 private lastTimeStamp;
    uint256 private lastTimeIndex;

    uint256 public slippageClient; //in x1000, so 5 -> 0.5% slippage
    uint256 public slippageExchange;
    uint256 public slippageDAI;

    uint256 private feeToTake;
    address payable shopchainAddress;

    IUniswapV2Router02 public immutable uniswapV2Router;

    IERC20 DAI = IERC20(0xcB1e72786A6eb3b44C2a2429e317c8a2462CFeb1);

    enum Status{
        CANCELLED,
        PAID,
        UNLOCKED,
        EXPIRED
    }

    struct PaymentEntry {
        address seller;
        uint256 price; // Dollars cent
    }

    struct SettledPayment {
        uint256 paymentEntryId;
        Status status;
        address client;
        uint256 time;
        uint256 finalizedTime;
        uint256 amountInDAI;
    }

    mapping(uint256 => PaymentEntry) private paymentsEntries;
    mapping(uint256 => SettledPayment) private settledPayments;

    event addedPaymentEntry(uint256 paymentEntryId);
    event paymentSettled(uint256 settledPaymentId);
    event statusChanged(uint256 settledPaymentId);

    modifier inBoundsPaymentEntryIndex(uint256 paymentEntryId) {
        require(paymentEntryId < freePaymentEntryId);
        _;
    }

    modifier inBoundsSettledPaymentIndex(uint256 settledPaymentId) {
        require(settledPaymentId < freeSettledPaymentId);
        _;
    }

    modifier onlyClient(uint256 settledPaymentId) {
        require(settledPayments[settledPaymentId].client == msg.sender);
        _;
    }

    modifier onlySeller(uint256 settledPaymentId) {
        require(paymentsEntries[settledPayments[settledPaymentId].paymentEntryId].seller == msg.sender);
        _;
    }

    modifier statusPaid(uint256 settledPaymentId) {
        require(settledPayments[settledPaymentId].status == Status.PAID);
        _;
    }

    modifier peggedDAI { //requires that the DAI value is pegged to USD (in the interval defined by slippageDAI), prevents catastrophic failure if DAI gets pwned
        (,int truncatedPriceDAI,,,) = priceFeedDAI.latestRoundData();
        uint256 priceDAI = uint256(truncatedPriceDAI) * 10**10; //8 decimals + 10 = 18 decimals
        require(priceDAI >= 10**18 - getSlippageAmount(10**18, slippageDAI) && priceDAI <= 10**18 + getSlippageAmount(10**18, slippageDAI));
        _;
    }

    modifier sufficientMatic(uint256 paymentEntryId) {
        (,int priceMatic,,,) = priceFeedMatic.latestRoundData(); //8 decimals
        uint256 priceInMatic = paymentsEntries[paymentEntryId].price * (10**24)/uint256(priceMatic);
        require(msg.value >= priceInMatic - getSlippageAmount(priceInMatic, slippageClient) && msg.value <= priceInMatic + getSlippageAmount(priceInMatic, slippageClient)); //client matic slippage check
        _;
    }

    /**
     * https://docs.chain.link/docs/matic-addresses/
     * Network: Mumbai Testnet
     * Aggregator: MATIC/USD Dec: 8
     * Address: 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
     */
    constructor(uint256 _batch, uint256 _interval, uint256 _expireDuration, uint256 _slippageClient, uint256 _slippageExchange, uint256 _slippageDAI, uint256 _feeToTake, address payable _shopchainAddress){

        batch = _batch;

        freePaymentEntryId = 0;
        freeSettledPaymentId = 0;

        lastTimeStamp = block.timestamp;
        lastTimeIndex = 0;

        interval = _interval;
        expireDuration = _expireDuration;

        slippageClient = _slippageClient;
        slippageExchange = _slippageExchange;
        slippageDAI = _slippageDAI;

        feeToTake = _feeToTake;
        shopchainAddress = _shopchainAddress;

        uniswapV2Router = IUniswapV2Router02(0x8954AfA98594b838bda56FE4C12a09D7739D179b);

    }

    function getSlippageAmount(uint256 number, uint256 slippage) internal pure returns(uint256){
        return (number * slippage)/1000;
    }

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval && block.timestamp - settledPayments[lastTimeIndex].time > expireDuration;
    }

    function performUpkeep(bytes calldata) external override {
        require((block.timestamp - lastTimeStamp) > interval  && block.timestamp - settledPayments[lastTimeIndex].time > expireDuration);
        uint256 i = lastTimeIndex;

        while (i < freeSettledPaymentId && (block.timestamp - settledPayments[i].time) > expireDuration && i - lastTimeIndex < batch) {
            if (settledPayments[i].status == Status.PAID) {

                DAI.transfer(settledPayments[i].client, settledPayments[i].amountInDAI);
                settledPayments[i].status = Status.EXPIRED;
                settledPayments[i].finalizedTime = block.timestamp;
                emit statusChanged(i);

            }
            i++;
        }

        // if we reached #batch transaction don't update lastTimeStamp so another upkeeper can keep processing the rest
        if (i - lastTimeIndex < batch) {
            lastTimeStamp = block.timestamp;
        }
        lastTimeIndex = i;

    }

    function addPaymentEntry(uint256 price) public {
        require(price > 0);
        paymentsEntries[freePaymentEntryId] = PaymentEntry(msg.sender, price);
        freePaymentEntryId = freePaymentEntryId + 1;
        emit addedPaymentEntry(freePaymentEntryId - 1);
    }

    function settlePayment(uint256 paymentEntryId) payable public inBoundsPaymentEntryIndex(paymentEntryId) sufficientMatic(paymentEntryId) peggedDAI{

        DAI.approve(address(uniswapV2Router), msg.value);

        address[] memory path = new address[](2);
        path[0] = uniswapV2Router.WETH(); //WMATIC canonic address
        path[1] = address(DAI);

        (,int truncatedPriceDAI,,,) = priceFeedDAI.latestRoundData();
        uint256 priceDAI = uint256(truncatedPriceDAI) * 10**10; //8 decimals + 10 = 18 decimals

        uint256 minAmountDAI = (paymentsEntries[paymentEntryId].price/priceDAI);
        minAmountDAI = minAmountDAI - getSlippageAmount(minAmountDAI, slippageExchange); //removes slippage %, slippageExchange is the slippage calculated on the real DAI price, value may vary according to slippageDAI

        uint[] memory amountsDAI = uniswapV2Router.swapExactETHForTokens{value: msg.value}(minAmountDAI, path, address(this), block.timestamp); //EXACT amount of DAI received

        settledPayments[freeSettledPaymentId] = SettledPayment(paymentEntryId, Status.PAID, msg.sender, block.timestamp, 0, amountsDAI[amountsDAI.length - 1]);
        freeSettledPaymentId = freeSettledPaymentId + 1;

        emit paymentSettled(freeSettledPaymentId - 1);

    }

    function unlockFunds(uint256 settledPaymentId) public inBoundsSettledPaymentIndex(settledPaymentId) onlyClient(settledPaymentId) statusPaid(settledPaymentId){

        address payable sellerAddress = payable(paymentsEntries[settledPayments[settledPaymentId].paymentEntryId].seller);

        uint256 amountToTake = (settledPayments[settledPaymentId].amountInDAI * feeToTake)/1000;

        DAI.transferFrom(address(this), sellerAddress, settledPayments[settledPaymentId].amountInDAI - amountToTake);
        DAI.transferFrom(address(this), shopchainAddress, amountToTake);

        settledPayments[settledPaymentId].status = Status.UNLOCKED;
        settledPayments[settledPaymentId].finalizedTime = block.timestamp;

        emit statusChanged(settledPaymentId);
    }

    function cancelPayment(uint256 settledPaymentId) public inBoundsSettledPaymentIndex(settledPaymentId) onlySeller(settledPaymentId) statusPaid(settledPaymentId){

        address payable addr = payable(settledPayments[settledPaymentId].client);
        DAI.transfer(addr, settledPayments[settledPaymentId].amountInDAI);

        settledPayments[settledPaymentId].status = Status.CANCELLED;
        settledPayments[settledPaymentId].finalizedTime = block.timestamp;

        emit statusChanged(settledPaymentId);
    }

    function revertPayment(uint256 settledPaymentId) public inBoundsSettledPaymentIndex(settledPaymentId) onlyClient(settledPaymentId) statusPaid(settledPaymentId){
        require(block.timestamp - settledPayments[settledPaymentId].time > expireDuration); //txn expired

        DAI.transfer(settledPayments[settledPaymentId].client, settledPayments[settledPaymentId].amountInDAI);
        settledPayments[settledPaymentId].status = Status.EXPIRED;
        settledPayments[settledPaymentId].finalizedTime = block.timestamp;

        emit statusChanged(settledPaymentId);
    }

    function getPaymentEntry(uint256 paymentEntryId) public view inBoundsPaymentEntryIndex(paymentEntryId) returns(PaymentEntry memory){
        return paymentsEntries[paymentEntryId];
    }

    function getSettledPayment(uint256 settledPaymentId) public view inBoundsSettledPaymentIndex(settledPaymentId) returns(SettledPayment memory){
        return settledPayments[settledPaymentId];
    }
}