import * as dotenv from "dotenv";

import Web3 from 'web3';

import { ShopContract } from "../../Persistence/ShopContract"

import { setTimeout } from 'timers'

jest.useFakeTimers()
dotenv.config()

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

describe('ShopContract', () => {  
    it('ShopContract - Real Contract', async () => {
        const contractABI = JSON.parse('[{\"inputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"paymentEntryId\",\"type\":\"uint256\"}],\"name\":\"addedPaymentEntry\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"settledPaymentId\",\"type\":\"uint256\"}],\"name\":\"fundsUnlocked\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"settledPaymentId\",\"type\":\"uint256\"}],\"name\":\"paymentCancelled\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"settledPaymentId\",\"type\":\"uint256\"}],\"name\":\"paymentSettled\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"objId\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"price\",\"type\":\"uint256\"}],\"name\":\"addPaymentEntry\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"settledPaymentId\",\"type\":\"uint256\"}],\"name\":\"cancelSettledPayment\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"paymentEntryId\",\"type\":\"uint256\"}],\"name\":\"getPaymentEntry\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"seller\",\"type\":\"address\"},{\"internalType\":\"string\",\"name\":\"objId\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"price\",\"type\":\"uint256\"}],\"internalType\":\"struct ShopContract.PaymentEntry\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"settledPaymentId\",\"type\":\"uint256\"}],\"name\":\"getSettledPayment\",\"outputs\":[{\"components\":[{\"internalType\":\"uint256\",\"name\":\"paymentEntryId\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"status\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"client\",\"type\":\"address\"}],\"internalType\":\"struct ShopContract.SettledPayment\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"renounceOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"paymentEntryId\",\"type\":\"uint256\"}],\"name\":\"settlePayment\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"settledPaymentId\",\"type\":\"uint256\"}],\"name\":\"unlockFunds\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]');
        
        const provider = new Web3.providers.WebsocketProvider('wss://speedy-nodes-nyc.moralis.io/' + process.env.API_KEY  + '/polygon/mumbai/ws')
        const web3 = new Web3(provider);
        const contract = new web3.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS);
        const shopContract =  new ShopContract(contract);

        let options = {
            filter: {
                value: [],
            },
            fromBlock: 0 // Don't sync last twice
        }
        shopContract.addedPaymentEntry(options)
        shopContract.paymentSettled(options)
        shopContract.getSettledPayment(BigInt(0))
        shopContract.getPaymentEntry(BigInt(0))

        provider.disconnect(0, "");
        await delay(1000);
    })
})