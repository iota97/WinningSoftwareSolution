import { SQL_Interface } from "./SQL"
import { ShopContract_Interface } from "./ShopContract"

class ShopContractEventManager {
	private shopContract: ShopContract_Interface;
	private sql: SQL_Interface;
	
	public constructor(sql: SQL_Interface, shopContract: ShopContract_Interface) {
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
				fromBlock: last + 1 // Don't sync last twice
			}
			
			this.shopContract.addedPaymentEntry(options)
			.on('error', (err: Error) => console.error(err))
			.on('data', (event: any) => { this.OnAddedPaymentEntry(event, this.shopContract, this.sql) })
			
			this.shopContract.paymentSettled(options)
			.on('error', (err: Error) => console.error(err))
			.on('data', (event: any) => { this.OnPaymentSettled(event, this.shopContract, this.sql) })

			this.shopContract.statusChange(options)
			.on('error', (err: Error) => console.error(err))
			.on('data', (event: any) => { this.OnStatusChange(event, this.shopContract, this.sql) })
		})
		.catch((err: Error) => {
			console.error(err)
		})
	}
	
	private OnAddedPaymentEntry(event: any, shopContract: ShopContract_Interface, sql: SQL_Interface) {
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
	
	private OnPaymentSettled(event: any, shopContract: ShopContract_Interface, sql: SQL_Interface) {
		let res: any;

		shopContract.getSettledPayment(event.returnValues.settledPaymentId)
		.then(async (res: any)  => {
			let time = await this.shopContract.getBlockTime(event.blockNumber);
	
			sql.insertSettledPayment({
				id: event.returnValues.settledPaymentId,
				item_id: res.paymentEntryId,
				buyer: res.client,
				status: res.status,
				created: time,
				confirmed: ""
			})
		})
		.then(() => {
			sql.setLastSyncBlock(event.blockNumber);
		})
		.catch((err: Error) => {
			console.error(err)
		})
	}

	private OnStatusChange(event: any, shopContract: ShopContract_Interface, sql: SQL_Interface) {
		shopContract.getSettledPayment(event.returnValues.settledPaymentId)
		.then(async (res: any) => {
			let time = await this.shopContract.getBlockTime(event.blockNumber);

			sql.updateSettledPayment(event.returnValues.settledPaymentId, res.status, time)
		})
		.then(() => {
			sql.setLastSyncBlock(event.blockNumber);
		})
		.catch((err: Error) => {
			console.error(err)
		})
	}
}

export { ShopContractEventManager }