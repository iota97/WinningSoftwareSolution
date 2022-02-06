//SPDX-License-Identifier: none

pragma solidity 0.8.10;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ShopContract is Ownable{

    using Address for address;
    using SafeMath for uint256;

    uint256 freePaymentEntryId;
    uint256 freeSettledPaymentId;

    struct PaymentEntry{
        address seller;
        string objId;
        uint256 price;
    }

    struct SettledPayment{
        uint256 paymentEntryId;
        uint256 status; //0 cancelled, 1 paid, 2 money unlocked and sent to seller
        address client;
    }

    mapping(uint256 => PaymentEntry) private paymentsEntries;
    mapping(uint256 => SettledPayment) private settledPayments;

    constructor(){

        freePaymentEntryId = 0;
        freeSettledPaymentId = 0;

    }

    event addedPaymentEntry(uint256 paymentEntryId);
    event paymentSettled(uint256 settledPaymentId);
    event paymentCancelled(uint256 settledPaymentId);

    event returnedPaymentEntry(PaymentEntry paymentEntry);
    event returnedSettledPayment(SettledPayment settledPayment);

    function addPaymentEntry(string calldata objId, uint256 price) public{

        require(price > 0);

        paymentsEntries[freePaymentEntryId] = PaymentEntry(msg.sender, objId, price);

        freePaymentEntryId = freePaymentEntryId + 1;

        emit addedPaymentEntry(freePaymentEntryId - 1); //event is emitted after everything else is done

    }

    function settlePayment(uint256 paymentEntryId) payable public{

        require(paymentEntryId < freePaymentEntryId);

        //require(paymentsEntries[paymentEntryId].price == msg.value); <-- controllo che il denaro inviato corrisponda a quello atteso && altra logica

        settledPayments[freeSettledPaymentId] = SettledPayment(paymentEntryId, 1, msg.sender);

        freeSettledPaymentId = freeSettledPaymentId + 1;

        emit paymentSettled(freeSettledPaymentId - 1);

    }

    function cancelSettledPayment(uint256 settledPaymentId) payable public{

        SettledPayment memory pSettled = settledPayments[settledPaymentId];
        PaymentEntry memory pEntry = paymentsEntries[pSettled.paymentEntryId];

        require(msg.sender == pEntry.seller); //only the original seller can cancel a settled payment
        require(pSettled.status != 0);

        if(pSettled.status == 1){ //if the money is still in the contracts balance

            require(msg.value == 0); //don't pay if you don't have to!

        }else{ //if the money is not anymore in the contracts balance seller needs to pay back the obj value to cancel a payment

            require(msg.value == pEntry.price); //seller has sent to this contract the money to send back to the client

        }

        //bool ok = transfer(pEntry.price, pSettled.client); //we send back the money to the client
        //require(ok);

        settledPayments[settledPaymentId].status = 0;

        emit paymentCancelled(settledPaymentId);

    }

    function getPaymentEntry(uint256 paymentEntryId) public{

        require(paymentEntryId < freePaymentEntryId);
        emit returnedPaymentEntry(paymentsEntries[paymentEntryId]);

    }

    function getSettledPayment(uint256 settledPaymentId) public{

        require(settledPaymentId < freeSettledPaymentId);
        emit returnedSettledPayment(settledPayments[settledPaymentId]);

    }

}