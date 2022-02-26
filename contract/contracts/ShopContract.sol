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

    uint256 freePaymentEntryId;
    uint256 freeSettledPaymentId;
    AggregatorV3Interface internal priceFeedMatic;
    AggregatorV3Interface internal priceFeedDAI;

    uint256 immutable interval;
    uint256 immutable expireDuration;
    uint256 lastTimeStamp;
    uint256 lastTimeIndex;

    uint256 slippageClient; //in x1000, so 5 -> 0.5% slippage

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

    /**
     * https://docs.chain.link/docs/matic-addresses/
     * Network: Mumbai Testnet
     * Aggregator: MATIC/USD Dec: 8
     * Address: 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
     */
    constructor(uint256 _interval, uint256 _expireDuration, uint256 _slippageClient){

        priceFeedMatic = AggregatorV3Interface(0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada);
        priceFeedDAI = AggregatorV3Interface(0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046);

        freePaymentEntryId = 0;
        freeSettledPaymentId = 0;

        lastTimeStamp = block.timestamp;
        lastTimeIndex = 0;

        interval = _interval;
        expireDuration = _expireDuration;

        slippageClient = _slippageClient;

        uniswapV2Router = IUniswapV2Router02(0x8954AfA98594b838bda56FE4C12a09D7739D179b); //uniswapv2 router for quickswap mumbai
        uniswapV2Factory = IUniswapV2Factory(uniswapV2Router.factory());

    }

    event addedPaymentEntry(uint256 paymentEntryId);
    event paymentSettled(uint256 settledPaymentId);
    event statusChanged(uint256 settledPaymentId);
    event test(uint256 value);

    function getSlippageAmount(uint256 number) public returns(uint256){
        return (number * slippageClient)/1000;
    }

    function checkUpkeep(bytes calldata) external override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;
    }

    function performUpkeep(bytes calldata) external override {
        if ((block.timestamp - lastTimeStamp) > interval) {
             uint256 i = lastTimeIndex;
             while (i < freeSettledPaymentId) {
                if ((block.timestamp - settledPayments[i].time) > expireDuration) {
                    if (settledPayments[i].status == 1) {
                       //payable(settledPayments[i].client).transfer(settledPayments[i].payed);
                       //TODO send back money to client
                       settledPayments[i].status = 3;

                       emit statusChanged(i);
                    }
                    i++;
                } else {
                    break;
                }
            }
            lastTimeIndex = i;
            lastTimeStamp = block.timestamp;
        }
    }

    function addPaymentEntry(uint256 price) public {
        require(price > 0);
        paymentsEntries[freePaymentEntryId] = PaymentEntry(msg.sender, price);
        freePaymentEntryId = freePaymentEntryId + 1;
        emit addedPaymentEntry(freePaymentEntryId - 1);
    }

    function settlePayment(uint256 paymentEntryId) payable public{

        require(paymentEntryId < freePaymentEntryId);

        uint256 valueWithSlippage = msg.value + getSlippageAmount(msg.value);

        (,int priceMatic,,,) = priceFeedMatic.latestRoundData(); //8 decimals
        uint256 priceInMatic = paymentsEntries[paymentEntryId].price * (10**24)/uint256(priceMatic);

        require(valueWithSlippage >= priceInMatic); //assure that you can pay with slippage
        //TODO fare in modo che uno non possa pagare un prezzo molto più alto del dovuto, non è necessario ma è una feature carina se no uno potrebbe perdere molti soldi

        require(DAI.approve(address(uniswapV2Router), msg.value), "Approve failed.");

        address[] memory path = new address[](2);
        path[0] = uniswapV2Router.WETH(); //WMATIC canonic address
        path[1] = address(DAI);
/*
        (,int priceDAI,,,) = priceFeedDAI.latestRoundData(); //8 decimals
        uint256 minAmountDAI = paymentsEntries[paymentEntryId].price * (10**24)/uint256(priceDAI); //price is in USD cents, adapt 8 decimals priceDAI to 18 decimals DAI
*/
        uint[] memory amountsDAI = uniswapV2Router.swapExactETHForTokens{value: msg.value}(0, path, address(this), block.timestamp); //EXACT amount of DAI received

        //uniswap returns a much lower number of DAI, maybe this is a problem only on ganache? 

        settledPayments[freeSettledPaymentId] = SettledPayment(paymentEntryId, 1, msg.sender, block.timestamp, amountsDAI[amountsDAI.length - 1]);
        freeSettledPaymentId = freeSettledPaymentId + 1;

        emit paymentSettled(freeSettledPaymentId - 1);

    }

    function unlockFunds(uint256 settledPaymentId) public {

        require(settledPayments[settledPaymentId].client == msg.sender);
        require(settledPayments[settledPaymentId].status == 1);

        address payable sellerAddress = payable(paymentsEntries[settledPayments[settledPaymentId].paymentEntryId].seller);

        DAI.transferFrom(address(this), sellerAddress, settledPayments[settledPaymentId].amountInDAI);

        settledPayments[settledPaymentId].status = 2;

        emit statusChanged(settledPaymentId);
    }

    function cancelPayment(uint256 settledPaymentId) public {
        require(paymentsEntries[settledPayments[settledPaymentId].paymentEntryId].seller == msg.sender);
        require(settledPayments[settledPaymentId].status == 1);

        address payable addr = payable(settledPayments[settledPaymentId].client);
        //addr.transfer(settledPayments[settledPaymentId].payed); TODO return money
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