//SPDX-License-Identifier: none

pragma solidity 0.8.12;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";

contract ShopContract is Ownable, KeeperCompatibleInterface {

    using Address for address;

    uint256 private freePaymentEntryId;
    uint256 private freeSettledPaymentId;
    AggregatorV3Interface internal priceFeedMatic;
    AggregatorV3Interface internal priceFeedDAI;

    uint256 private immutable interval;
    uint256 private immutable expireDuration;
    uint256 private lastTimeStamp;
    uint256 private lastTimeIndex;

    uint256 public slippageClient; //in x1000, so 5 -> 0.5% slippage
    uint256 public slippageExchange;

    IUniswapV2Router02 public immutable uniswapV2Router;
    IUniswapV2Factory public immutable uniswapV2Factory;

    IERC20 DAI = IERC20(0xcB1e72786A6eb3b44C2a2429e317c8a2462CFeb1);

    struct PaymentEntry {
        address seller;
        uint256 price; // Dollars cent
    }

    struct SettledPayment {
        uint256 paymentEntryId;
        uint256 status; //0 cancelled, 1 paid, 2 money unlocked, 3 timed out
        address client;
        uint256 time;
        uint256 amountInDAI;
    }

    mapping(uint256 => PaymentEntry) private paymentsEntries;
    mapping(uint256 => SettledPayment) private settledPayments;

    event addedPaymentEntry(uint256 paymentEntryId);
    event paymentSettled(uint256 settledPaymentId);
    event statusChanged(uint256 settledPaymentId);

    /**
     * https://docs.chain.link/docs/matic-addresses/
     * Network: Mumbai Testnet
     * Aggregator: MATIC/USD Dec: 8
     * Address: 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
     */
    constructor(uint256 _interval, uint256 _expireDuration, uint256 _slippageClient, uint256 _slippageExchange){

        priceFeedMatic = AggregatorV3Interface(0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada);
        priceFeedDAI = AggregatorV3Interface(0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046);

        freePaymentEntryId = 0;
        freeSettledPaymentId = 0;

        lastTimeStamp = block.timestamp;
        lastTimeIndex = 0;

        interval = _interval;
        expireDuration = _expireDuration;

        slippageClient = _slippageClient;
        slippageExchange = _slippageExchange;

        uniswapV2Router = IUniswapV2Router02(0x8954AfA98594b838bda56FE4C12a09D7739D179b); //uniswapv2 router for quickswap mumbai
        uniswapV2Factory = IUniswapV2Factory(uniswapV2Router.factory());

    }

    function getUniswapMaticValueInDAI() public view returns(uint){
        uint256 amount = 1;
        IUniswapV2Pair pair = IUniswapV2Pair(uniswapV2Factory.getPair(address(DAI), address(uniswapV2Router.WETH())));
        (uint Res1, uint Res0,) = pair.getReserves();

        // decimals
        uint res0 = Res0*(10**18);
        return((amount*res0)/Res1);
    }

    function getSlippageAmount(uint256 number, uint256 slippage) public returns(uint256){
        return (number * slippage)/1000;
    }

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;
    }

    function performUpkeep(bytes calldata) external override {

        require((block.timestamp - lastTimeStamp) > interval);
        uint256 i = lastTimeIndex;

        while (i < freeSettledPaymentId && (block.timestamp - settledPayments[i].time) > expireDuration) {

            if (settledPayments[i].status == 1) {

                DAI.transfer(settledPayments[i].client, settledPayments[i].amountInDAI);
                settledPayments[i].status = 3;
                emit statusChanged(i);

            }
            i++;
        }
        lastTimeIndex = i;
        lastTimeStamp = block.timestamp;
    }

    function addPaymentEntry(uint256 price) public {
        require(price > 0);
        paymentsEntries[freePaymentEntryId] = PaymentEntry(msg.sender, price);
        freePaymentEntryId = freePaymentEntryId + 1;
        emit addedPaymentEntry(freePaymentEntryId - 1);
    }

    function settlePayment(uint256 paymentEntryId) payable public{

        require(paymentEntryId < freePaymentEntryId);

        (,int priceMatic,,,) = priceFeedMatic.latestRoundData(); //8 decimals
        uint256 priceInMatic = paymentsEntries[paymentEntryId].price * (10**24)/uint256(priceMatic);

        require(msg.value >= priceInMatic - getSlippageAmount(priceInMatic, slippageClient) && msg.value <= priceInMatic + getSlippageAmount(priceInMatic, slippageClient)); //assure that you can pay with slippage

        require(DAI.approve(address(uniswapV2Router), msg.value), "Approve failed.");

        address[] memory path = new address[](2);
        path[0] = uniswapV2Router.WETH(); //WMATIC canonic address
        path[1] = address(DAI);

        (,int priceDAI,,,) = priceFeedDAI.latestRoundData(); //8 decimals

        uint256 uniswapMaticValueInDAI = getUniswapMaticValueInDAI(); //on mumbai this price is way lower than expected because of liquidity issues
        uint256 chainlinkMaticValueInDAI = (uint256(priceMatic) * 10**18) / (uint256(priceDAI)); // 8 decs * 18 decs / 8 decs = 18 decs

        //protects from flash loan attack
        require(uniswapMaticValueInDAI <= chainlinkMaticValueInDAI + getSlippageAmount(chainlinkMaticValueInDAI, slippageExchange) && uniswapMaticValueInDAI >= chainlinkMaticValueInDAI - getSlippageAmount(chainlinkMaticValueInDAI, slippageExchange));

        uint[] memory amountsDAI = uniswapV2Router.swapExactETHForTokens{value: msg.value}(0, path, address(this), block.timestamp); //EXACT amount of DAI received

        settledPayments[freeSettledPaymentId] = SettledPayment(paymentEntryId, 1, msg.sender, block.timestamp, amountsDAI[amountsDAI.length - 1]);
        freeSettledPaymentId = freeSettledPaymentId + 1;

        emit paymentSettled(freeSettledPaymentId - 1);

    }

    function unlockFunds(uint256 settledPaymentId) public {

        require(settledPaymentId < freeSettledPaymentId);
        require(settledPayments[settledPaymentId].client == msg.sender);
        require(settledPayments[settledPaymentId].status == 1);

        address payable sellerAddress = payable(paymentsEntries[settledPayments[settledPaymentId].paymentEntryId].seller);

        DAI.transferFrom(address(this), sellerAddress, settledPayments[settledPaymentId].amountInDAI);

        settledPayments[settledPaymentId].status = 2;

        emit statusChanged(settledPaymentId);
    }

    function cancelPayment(uint256 settledPaymentId) public {
        require(settledPaymentId < freeSettledPaymentId);
        require(paymentsEntries[settledPayments[settledPaymentId].paymentEntryId].seller == msg.sender);
        require(settledPayments[settledPaymentId].status == 1);

        address payable addr = payable(settledPayments[settledPaymentId].client);
        DAI.transfer(addr, settledPayments[settledPaymentId].amountInDAI);

        settledPayments[settledPaymentId].status = 0;

        emit statusChanged(settledPaymentId);
    }

    function getPaymentEntry(uint256 paymentEntryId) public view returns(PaymentEntry memory){
        require(paymentEntryId < freePaymentEntryId);
        return paymentsEntries[paymentEntryId];
    }

    function getSettledPayment(uint256 settledPaymentId) public view returns(SettledPayment memory){
        require(settledPaymentId < freeSettledPaymentId);
        return settledPayments[settledPaymentId];
    }
}