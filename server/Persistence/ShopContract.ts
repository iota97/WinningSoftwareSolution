import { Contract, PastEventOptions } from "web3-eth-contract"
import * as CONTRACT from "../public/contract/contract.json";
import Web3 from 'web3';
import { paymentEntry } from "./Types/paymentEntry";
import { settledPayment } from "./Types/settledPayment";
import { EventEmitter } from 'events'

export interface ShopContract_Interface {
	addedPaymentEntry: (options: PastEventOptions) => EventEmitter;
	paymentSettled: (options: PastEventOptions) => EventEmitter;
	statusChange: (options: PastEventOptions) => EventEmitter;
	
	getBlockTime: (block: number) => Promise<string>

	getSettledPayment: (id: bigint) => Promise<settledPayment>;
	getPaymentEntry: (id: bigint) => Promise<paymentEntry>;
}

export class ShopContract implements ShopContract_Interface {
	private contract: Contract;
	private web3: Web3;
	
	public constructor(web3: Web3) {
		this.web3 = web3;
		const contract = new web3.eth.Contract(JSON.parse(CONTRACT.ABI), CONTRACT.ADDRESS);
		this.contract = contract;
	}
	
	public async getBlockTime(block: number): Promise<string> {
		let b = await this.web3.eth.getBlock(block)
		return String(b.timestamp);
	}
	public addedPaymentEntry(options: PastEventOptions): EventEmitter {
		return this.contract.events.addedPaymentEntry(options)
	}
	
	public paymentSettled(options: PastEventOptions): EventEmitter {
		return this.contract.events.paymentSettled(options)
	}
	
	public statusChange(options: PastEventOptions): EventEmitter {
		return this.contract.events.statusChanged(options)
	}
	
	public getSettledPayment(id: bigint): Promise<settledPayment> {
		return this.contract.methods.getSettledPayment(id).call()
	}
	
	public getPaymentEntry(id: bigint): Promise<paymentEntry> {
		return this.contract.methods.getPaymentEntry(id).call()
	}
}