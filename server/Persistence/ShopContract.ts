import { Contract } from "web3-eth-contract"

export interface ShopContract_Interface {
	addedPaymentEntry: (options: any) => any;
	paymentSettled: (options: any) => any;
	getSettledPayment: (id: bigint) => any;
	getPaymentEntry: (id: bigint) => any;
}

export class ShopContract implements ShopContract_Interface {
	private contract: Contract;

	public constructor(contract: Contract) {
		this.contract = contract;
	}

	public addedPaymentEntry(options: any) {
		return this.contract.events.addedPaymentEntry(options)
	}

	public paymentSettled(options: any) {
		return this.contract.events.paymentSettled(options)
	}

	public getSettledPayment(id: bigint) {
		return this.contract.methods.getSettledPayment(id).call()
	}

	public getPaymentEntry(id: bigint) {
		return this.contract.methods.getPaymentEntry(id).call()
	}
}