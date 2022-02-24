//SPDX-License-Identifier: none

pragma solidity 0.8.12;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

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

    struct PaymentEntry {
        address seller;
        uint256 price; // Dollars cent
    }

    struct SettledPayment {
        uint256 paymentEntryId;
        uint256 status; //0 cancelled, 1 paid, 2 money unlocked, 3 timed out
        address client;
        uint256 time;
        uint256 payed; // In Wei
    }

    mapping(uint256 => PaymentEntry) private paymentsEntries;
    mapping(uint256 => SettledPayment) private settledPayments;

    /**
     * https://docs.chain.link/docs/matic-addresses/
     * Network: Mumbai Testnet
     * Aggregator: MATIC/USD Dec: 8
     * Address: 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
     */
    constructor(){
        priceFeed = AggregatorV3Interface(0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada);

        interval = 60; // Check every 60 sec, change to 1 hour
        lastTimeStamp = block.timestamp;
        lastTimeIndex = 0;
        freePaymentEntryId = 0;
        freeSettledPaymentId = 0;
        expireDuration = 60*10; // expire after 10 min, change to 14 days
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
                       payable(settledPayments[i].client).transfer(settledPayments[i].payed);
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
        require(paymentsEntries[paymentEntryId].price*getLatestPrice() <= msg.value);
        settledPayments[freeSettledPaymentId] = SettledPayment(paymentEntryId, 1, msg.sender, block.timestamp, msg.value);
        freeSettledPaymentId = freeSettledPaymentId + 1;
        emit paymentSettled(freeSettledPaymentId - 1);
    }

    function unlockFunds(uint256 settledPaymentId) public {
        require(settledPayments[settledPaymentId].client == msg.sender);
        require(settledPayments[settledPaymentId].status == 1);

        address payable addr = payable(paymentsEntries[settledPayments[settledPaymentId].paymentEntryId].seller);
        addr.transfer(settledPayments[settledPaymentId].payed);
        settledPayments[settledPaymentId].status = 2;

        emit statusChanged(settledPaymentId);
    }

    function cancelPayment(uint256 settledPaymentId) public {
        require(paymentsEntries[settledPayments[settledPaymentId].paymentEntryId].seller == msg.sender);
        require(settledPayments[settledPaymentId].status == 1);

        address payable addr = payable(settledPayments[settledPaymentId].client);
        addr.transfer(settledPayments[settledPaymentId].payed);
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