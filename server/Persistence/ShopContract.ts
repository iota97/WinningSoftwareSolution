import * as paymentEntryModel from "../DB/paymentEntries";
import * as settledPaymentModel from "../DB/settledPayments";

import Web3 from 'web3';
import { Contract } from "web3-eth-contract"
import { SQL } from "./SQL"

const contractABI = JSON.parse('[{\"inputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"paymentEntryId\",\"type\":\"uint256\"}],\"name\":\"addedPaymentEntry\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"settledPaymentId\",\"type\":\"uint256\"}],\"name\":\"fundsUnlocked\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"settledPaymentId\",\"type\":\"uint256\"}],\"name\":\"paymentCancelled\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"settledPaymentId\",\"type\":\"uint256\"}],\"name\":\"paymentSettled\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"objId\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"price\",\"type\":\"uint256\"}],\"name\":\"addPaymentEntry\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"settledPaymentId\",\"type\":\"uint256\"}],\"name\":\"cancelSettledPayment\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"paymentEntryId\",\"type\":\"uint256\"}],\"name\":\"getPaymentEntry\",\"outputs\":[{\"components\":[{\"internalType\":\"address\",\"name\":\"seller\",\"type\":\"address\"},{\"internalType\":\"string\",\"name\":\"objId\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"price\",\"type\":\"uint256\"}],\"internalType\":\"struct ShopContract.PaymentEntry\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"settledPaymentId\",\"type\":\"uint256\"}],\"name\":\"getSettledPayment\",\"outputs\":[{\"components\":[{\"internalType\":\"uint256\",\"name\":\"paymentEntryId\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"status\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"client\",\"type\":\"address\"}],\"internalType\":\"struct ShopContract.SettledPayment\",\"name\":\"\",\"type\":\"tuple\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"renounceOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"paymentEntryId\",\"type\":\"uint256\"}],\"name\":\"settlePayment\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"settledPaymentId\",\"type\":\"uint256\"}],\"name\":\"unlockFunds\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]');

class ShopContract {
	private static instance: ShopContract;
	private shopContract: Contract;
	
	private constructor() {
		const web3 = new Web3(new Web3.providers.WebsocketProvider('wss://speedy-nodes-nyc.moralis.io/' + process.env.API_KEY  + '/polygon/mumbai/ws'))
		this.shopContract = new web3.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS)
	}

	public static get(): ShopContract {
		if (!ShopContract.instance) {
			ShopContract.instance = new ShopContract();
		}
		
		return ShopContract.instance;
	}

	public hookEvent() {
		SQL.get().getLastSyncBlock()
		.then((last: any) => {
			let options = {
				filter: {
					value: [],
				},
				fromBlock: last
			}
			console.log("Last block synced was: " + last)
			
			ShopContract.get().shopContract.events.addedPaymentEntry(options)
			.on('error', (err: Error) => console.error(err))
			.on('data', this.OnAddedPaymentEntry)
			
			ShopContract.get().shopContract.events.paymentSettled(options)
			.on('error', (err: Error) => console.error(err))
			.on('data', this.OnPaymentSettled)
		})
		.catch((err: Error) => {
			console.error(err)
		})
	}

	private OnAddedPaymentEntry(event: any) {
		ShopContract.get().shopContract.methods.getPaymentEntry(event.returnValues.paymentEntryId).call()
		.then((res: any) => {
			paymentEntryModel.create({id: event.returnValues.paymentEntryId, ecommerce: res.seller}, (err: Error, id: string) => {
				if (err) {
					console.log(err);
				}
				SQL.get().setLastSyncBlock(event.blockNumber);
			})	
		}).catch((err: Error) => {
			console.error(err)
		})
	}
	
	private OnPaymentSettled(event: any) {
		ShopContract.get().shopContract.methods.getSettledPayment(event.returnValues.settledPaymentId).call()
		.then((res: any) => {
			settledPaymentModel.create({id: event.returnValues.settledPaymentId, acquirente: res.client}, (err: Error, id: string) => {
				if (err) {
					console.log(err);
				}
				SQL.get().setLastSyncBlock(event.blockNumber);
			})			
		}).catch((err: Error) => {
			console.error(err)
		})
	}
}

export { ShopContract }