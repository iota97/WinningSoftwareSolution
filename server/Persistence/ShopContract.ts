import { Contract } from "web3-eth-contract"
import { SQL_Interface } from "./SQL"

export interface Web3_Contract_Interface {
	addedPaymentEntry: (options: any) => any;
	paymentSettled: (options: any) => any;
	getSettledPayment: (id: bigint) => any;
	getPaymentEntry: (id: bigint) => any;
}

class Web3_Contract implements Web3_Contract_Interface {
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

class ShopContract {
	private shopContract: Web3_Contract_Interface;
	private sql: SQL_Interface;
	
	public constructor(sql: SQL_Interface, shopContract: Web3_Contract_Interface) {
		this.sql = sql
		this.shopContract = shopContract

		this.hookEvent()
	}
	
	private hookEvent() {
		this.sql.getLastSyncBlock()
		.then((last: any) => {
			let options = {
				filter: {
					value: [],
				},
				fromBlock: last+BigInt(1) // Don't sync last twice
			}
			
			this.shopContract.addedPaymentEntry(options)
			.on('error', (err: Error) => console.error(err))
			.on('data', (event: any) => { this.OnAddedPaymentEntry(event, this.shopContract, this.sql) })
			
			this.shopContract.paymentSettled(options)
			.on('error', (err: Error) => console.error(err))
			.on('data', (event: any) => { this.OnPaymentSettled(event, this.shopContract, this.sql) })
		})
		.catch((err: Error) => {
			console.error(err)
		})
	}
	
	private OnAddedPaymentEntry(event: any, shopContract: Web3_Contract_Interface, sql: SQL_Interface) {
		shopContract.getPaymentEntry(event.returnValues.paymentEntryId)
		.then((res: any) => {
			sql.insertPaymentEntry({id: event.returnValues.paymentEntryId, ecommerce: res.seller, price: res.price})
		})
		.then(() => {
			sql.setLastSyncBlock(event.blockNumber);
		})
		.catch((err: Error) => {
			console.error(err)
		})
	}
	
	private OnPaymentSettled(event: any, shopContract: Web3_Contract_Interface, sql: SQL_Interface) {
		shopContract.getSettledPayment(event.returnValues.settledPaymentId)
		.then((res: any) => {
			sql.insertSettledPayment({id: event.returnValues.settledPaymentId, item_id: res.paymentEntryId, buyer: res.client, status: res.status})
		})
		.then(() => {
			sql.setLastSyncBlock(event.blockNumber);
		})
		.catch((err: Error) => {
			console.error(err)
		})
	}
}

export { ShopContract, Web3_Contract }