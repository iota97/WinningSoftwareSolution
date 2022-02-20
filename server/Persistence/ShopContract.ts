import { Contract } from "web3-eth-contract"
import Web3 from 'web3';

export interface ShopContract_Interface {
	addedPaymentEntry: (options: any) => any;
	paymentSettled: (options: any) => any;
	statusChange: (options: any) => any;
	
	getBlockTime: (block: number) => Promise<string>

	getSettledPayment: (id: bigint) => any;
	getPaymentEntry: (id: bigint) => any;
}

const contractABI = JSON.parse('[ { \"anonymous\": false, \"inputs\": [ { \"indexed\": true, \"internalType\": \"address\", \"name\": \"previousOwner\", \"type\": \"address\" }, { \"indexed\": true, \"internalType\": \"address\", \"name\": \"newOwner\", \"type\": \"address\" } ], \"name\": \"OwnershipTransferred\", \"type\": \"event\" }, { \"anonymous\": false, \"inputs\": [ { \"indexed\": false, \"internalType\": \"uint256\", \"name\": \"paymentEntryId\", \"type\": \"uint256\" } ], \"name\": \"addedPaymentEntry\", \"type\": \"event\" }, { \"anonymous\": false, \"inputs\": [ { \"indexed\": false, \"internalType\": \"uint256\", \"name\": \"settledPaymentId\", \"type\": \"uint256\" } ], \"name\": \"paymentSettled\", \"type\": \"event\" }, { \"anonymous\": false, \"inputs\": [ { \"indexed\": false, \"internalType\": \"uint256\", \"name\": \"settledPaymentId\", \"type\": \"uint256\" } ], \"name\": \"statusChanged\", \"type\": \"event\" }, { \"inputs\": [ { \"internalType\": \"uint256\", \"name\": \"price\", \"type\": \"uint256\" } ], \"name\": \"addPaymentEntry\", \"outputs\": [], \"stateMutability\": \"nonpayable\", \"type\": \"function\" }, { \"inputs\": [ { \"internalType\": \"bytes\", \"name\": \"\", \"type\": \"bytes\" } ], \"name\": \"checkUpkeep\", \"outputs\": [ { \"internalType\": \"bool\", \"name\": \"upkeepNeeded\", \"type\": \"bool\" }, { \"internalType\": \"bytes\", \"name\": \"\", \"type\": \"bytes\" } ], \"stateMutability\": \"nonpayable\", \"type\": \"function\" }, { \"inputs\": [ { \"internalType\": \"bytes\", \"name\": \"\", \"type\": \"bytes\" } ], \"name\": \"performUpkeep\", \"outputs\": [], \"stateMutability\": \"nonpayable\", \"type\": \"function\" }, { \"inputs\": [], \"name\": \"renounceOwnership\", \"outputs\": [], \"stateMutability\": \"nonpayable\", \"type\": \"function\" }, { \"inputs\": [ { \"internalType\": \"uint256\", \"name\": \"paymentEntryId\", \"type\": \"uint256\" } ], \"name\": \"settlePayment\", \"outputs\": [], \"stateMutability\": \"payable\", \"type\": \"function\" }, { \"inputs\": [ { \"internalType\": \"address\", \"name\": \"newOwner\", \"type\": \"address\" } ], \"name\": \"transferOwnership\", \"outputs\": [], \"stateMutability\": \"nonpayable\", \"type\": \"function\" }, { \"inputs\": [ { \"internalType\": \"uint256\", \"name\": \"settledPaymentId\", \"type\": \"uint256\" } ], \"name\": \"unlockFunds\", \"outputs\": [], \"stateMutability\": \"nonpayable\", \"type\": \"function\" }, { \"inputs\": [], \"stateMutability\": \"nonpayable\", \"type\": \"constructor\" }, { \"inputs\": [], \"name\": \"getLatestPrice\", \"outputs\": [ { \"internalType\": \"uint256\", \"name\": \"p\", \"type\": \"uint256\" } ], \"stateMutability\": \"view\", \"type\": \"function\" }, { \"inputs\": [ { \"internalType\": \"uint256\", \"name\": \"paymentEntryId\", \"type\": \"uint256\" } ], \"name\": \"getPaymentEntry\", \"outputs\": [ { \"components\": [ { \"internalType\": \"address\", \"name\": \"seller\", \"type\": \"address\" }, { \"internalType\": \"uint256\", \"name\": \"price\", \"type\": \"uint256\" } ], \"internalType\": \"struct ShopContract.PaymentEntry\", \"name\": \"\", \"type\": \"tuple\" } ], \"stateMutability\": \"view\", \"type\": \"function\" }, { \"inputs\": [ { \"internalType\": \"uint256\", \"name\": \"settledPaymentId\", \"type\": \"uint256\" } ], \"name\": \"getSettledPayment\", \"outputs\": [ { \"components\": [ { \"internalType\": \"uint256\", \"name\": \"paymentEntryId\", \"type\": \"uint256\" }, { \"internalType\": \"uint256\", \"name\": \"status\", \"type\": \"uint256\" }, { \"internalType\": \"address\", \"name\": \"client\", \"type\": \"address\" }, { \"internalType\": \"uint256\", \"name\": \"time\", \"type\": \"uint256\" }, { \"internalType\": \"uint256\", \"name\": \"payed\", \"type\": \"uint256\" } ], \"internalType\": \"struct ShopContract.SettledPayment\", \"name\": \"\", \"type\": \"tuple\" } ], \"stateMutability\": \"view\", \"type\": \"function\" }, { \"inputs\": [], \"name\": \"owner\", \"outputs\": [ { \"internalType\": \"address\", \"name\": \"\", \"type\": \"address\" } ], \"stateMutability\": \"view\", \"type\": \"function\" } ]');

export class ShopContract implements ShopContract_Interface {
	private contract: Contract;
	private web3: Web3;
	
	public constructor(web3: Web3) {
		this.web3 = web3;
		const contract = new web3.eth.Contract(contractABI, process.env.CONTRACT_ADDRESS);
		this.contract = contract;
	}
	
	public async getBlockTime(block: number) {
		let b = await this.web3.eth.getBlock(block)
		return String(b.timestamp);
	}
	public addedPaymentEntry(options: any) {
		return this.contract.events.addedPaymentEntry(options)
	}
	
	public paymentSettled(options: any) {
		return this.contract.events.paymentSettled(options)
	}
	
	public statusChange(options: any) {
		// TODO change this
		return this.contract.events.statusChanged(options)
	}
	
	public getSettledPayment(id: bigint) {
		return this.contract.methods.getSettledPayment(id).call()
	}
	
	public getPaymentEntry(id: bigint) {
		return this.contract.methods.getPaymentEntry(id).call()
	}
}