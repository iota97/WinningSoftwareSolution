import { Contract } from "web3-eth-contract"
import * as CONTRACT from "../public/contract/contract.json";
import Web3 from 'web3';

export interface ShopContract_Interface {
	addedPaymentEntry: (options: any) => any;
	paymentSettled: (options: any) => any;
	statusChange: (options: any) => any;
	
	getBlockTime: (block: number) => Promise<string>

	getSettledPayment: (id: bigint) => any;
	getPaymentEntry: (id: bigint) => any;
}

export class ShopContract implements ShopContract_Interface {
	private contract: Contract;
	private web3: Web3;
	
	public constructor(web3: Web3) {
		this.web3 = web3;
		const contract = new web3.eth.Contract(JSON.parse(CONTRACT.ABI), CONTRACT.ADDRESS);
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