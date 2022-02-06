import {createServer} from './routes/index'
import Web3 from 'web3';
import * as dotenv from "dotenv";
dotenv.config();

createServer();

const contractABI = JSON.parse('[{\"inputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"paymentEntryId\",\"type\":\"uint256\"}],\"name\":\"addedPaymentEntry\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"settledPaymentId\",\"type\":\"uint256\"}],\"name\":\"paymentCancelled\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"settledPaymentId\",\"type\":\"uint256\"}],\"name\":\"paymentSettled\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"objId\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"price\",\"type\":\"uint256\"}],\"name\":\"addPaymentEntry\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"settledPaymentId\",\"type\":\"uint256\"}],\"name\":\"cancelSettledPayment\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"paymentEntryId\",\"type\":\"uint256\"}],\"name\":\"getPaymentEntry\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"seller\",\"type\":\"address\"},{\"internalType\":\"string\",\"name\":\"objId\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"price\",\"type\":\"uint256\"}],\"internalType\":\"struct ShopContract.PaymentEntry\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"settledPaymentId\",\"type\":\"uint256\"}],\"name\":\"getSettledPayment\",\"outputs\":[{\"components\":[{\"internalType\":\"uint256\",\"name\":\"paymentEntryId\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"status\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"client\",\"type\":\"address\"}],\"internalType\":\"struct ShopContract.SettledPayment\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"renounceOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"paymentEntryId\",\"type\":\"uint256\"}],\"name\":\"settlePayment\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]');

const contractAddress = "0xd0788b436100B967B68e59665cB404f601ED841f";

const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://speedy-nodes-nyc.moralis.io/' + process.env.APIKEY  + '/polygon/mumbai/ws'));

const ShopContract = new web3.eth.Contract(contractABI, contractAddress);

let options = {
    filter: {
        value: [],
    },
    fromBlock: 0
};

//spiegone @ https://www.coinclarified.com/p/3-ways-to-subscribe-to-events-with-web3-js/
ShopContract.events.addedPaymentEntry(options)
    .on('data', (event: any) => console.log(event)) //evento ricevuto
    .on('error', (err: any) => console.log(err))
    .on('connected', (str: any) => console.log(str));

