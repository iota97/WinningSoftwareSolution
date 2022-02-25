//SPDX-License-Identifier: none

pragma solidity 0.8.12;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract ShopContract is Ownable, KeeperCompatibleInterface {
    using Address for address;
    using SafeMath for uint256;

    uint256 freePaymentEntryId;
    uint256 freeSettledPaymentId;
    AggregatorV3Interface internal priceFeed;

    uint256 immutable interval;
    uint256 immutable expireDuration;
    uint256 lastTimeStamp;
    uint256 lastTimeIndex;

    IUniswapV2Router02 public immutable uniswapV2Router;
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
    }

    mapping(uint256 => PaymentEntry) private paymentsEntries;
    mapping(uint256 => SettledPayment) private settledPayments;

    /**
     * https://docs.chain.link/docs/matic-addresses/
     * Network: Mumbai Testnet
     * Aggregator: MATIC/USD Dec: 8
     * Address: 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
     */
    constructor(uint256 _interval, uint256 _expireDuration){

        priceFeed = AggregatorV3Interface(0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada);

        freePaymentEntryId = 0;
        freeSettledPaymentId = 0;

        lastTimeStamp = block.timestamp;
        lastTimeIndex = 0;

        interval = _interval; // Check every 60 sec, change to 1 hour
        expireDuration = _expireDuration; // expire after 10 min, change to 14 days

        IUniswapV2Router02 _uniswapV2Router = IUniswapV2Router02(0x8954AfA98594b838bda56FE4C12a09D7739D179b); //uniswapv2 router for quickswap mumbai
        uniswapV2Router = _uniswapV2Router;

    }

    event addedPaymentEntry(uint256 paymentEntryId);
    event paymentSettled(uint256 settledPaymentId);
    event statusChanged(uint256 settledPaymentId);

    function getLatestPrice() public view returns (uint256 p) {
        (,int price,,,) = priceFeed.latestRoundData();
        return (10**24)/uint256(price);
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
        require(paymentsEntries[paymentEntryId].price * getLatestPrice() <= msg.value);
        settledPayments[freeSettledPaymentId] = SettledPayment(paymentEntryId, 1, msg.sender, block.timestamp);
        freeSettledPaymentId = freeSettledPaymentId + 1;

        require(DAI.approve(address(uniswapV2Router), msg.value), "approve failed");

        address[] memory path = new address[](2);
        path[0] = uniswapV2Router.WETH();
        path[1] = address(DAI);

        uniswapV2Router.swapExactETHForTokens{value: msg.value}(0, path, address(this), block.timestamp + 10000); //TODO? set min dai as slippage

        emit paymentSettled(freeSettledPaymentId - 1);

    }

    function unlockFunds(uint256 settledPaymentId) public {
        require(settledPayments[settledPaymentId].client == msg.sender);
        require(settledPayments[settledPaymentId].status == 1);

        address payable sellerAddress = payable(paymentsEntries[settledPayments[settledPaymentId].paymentEntryId].seller);

        DAI.transferFrom(address(this), sellerAddress, paymentsEntries[settledPayments[settledPaymentId].paymentEntryId].price * 10**16); //TODO price in usd cents so add 16 decimals MINUS SLIPPAGE OR UNSUFFICIENT BALANCE

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