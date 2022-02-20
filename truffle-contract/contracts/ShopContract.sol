//SPDX-License-Identifier: none

pragma solidity 0.8.10;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract ShopContract is Ownable{
    using Address for address;
    using SafeMath for uint256;

    uint256 freePaymentEntryId;
    uint256 freeSettledPaymentId;
    AggregatorV3Interface internal priceFeed;

    struct PaymentEntry {
        address seller;
        uint256 price; // Dollars cent
    }

    struct SettledPayment {
        uint256 paymentEntryId;
        uint256 status; //0 cancelled, 1 paid, 2 money unlocked, 3 money sent to seller
        address client;
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

        freePaymentEntryId = 0;
        freeSettledPaymentId = 0;
    }

    event addedPaymentEntry(uint256 paymentEntryId);
    event paymentSettled(uint256 settledPaymentId);
    event statusChanged(uint256 settledPaymentId);

    function getLatestPrice() public view returns (uint256) {
        (,int price,,,) = priceFeed.latestRoundData();
        return uint256(price)*(10**8);
    }

    function addPaymentEntry(uint256 price) public{
        require(price > 0);
        paymentsEntries[freePaymentEntryId] = PaymentEntry(msg.sender, price);
        freePaymentEntryId = freePaymentEntryId + 1;
        emit addedPaymentEntry(freePaymentEntryId - 1); //event is emitted after everything else is done
    }

    function settlePayment(uint256 paymentEntryId) payable public{
        require(paymentEntryId < freePaymentEntryId);
        require(paymentsEntries[paymentEntryId].price*getLatestPrice() == msg.value); // <-- controllo che il denaro inviato corrisponda a quello atteso && altra logica
        settledPayments[freeSettledPaymentId] = SettledPayment(paymentEntryId, 1, msg.sender);
        freeSettledPaymentId = freeSettledPaymentId + 1;
        emit paymentSettled(freeSettledPaymentId - 1);
    }

    function unlockFunds(uint256 settledPaymentId) public{
        require(settledPayments[settledPaymentId].client == msg.sender);
        require(settledPayments[settledPaymentId].status == 1);

        settledPayments[settledPaymentId].status = 2;
        //qui deve andare il timer/inviare i soldi al venditore/logica e controlli

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