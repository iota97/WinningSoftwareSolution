import { SQL_Interface } from "./SQL_Interface"
import { ShopContract_Interface } from "./ShopContract_Interface"
import { EventData } from "web3-eth-contract"
import { settledPayment } from "./Types/settledPayment"
import { paymentEntry } from "./Types/paymentEntry";

class ShopContractEventManager {
	private shopContract: ShopContract_Interface;
	private sql: SQL_Interface;
	
	public constructor(sql: SQL_Interface, shopContract: ShopContract_Interface) {
		this.sql = sql
		this.shopContract = shopContract

		this.hookEvent()
	}
	
	private hookEvent(): void {
		this.sql.getLastSyncBlock()
		.then((last: number) => {
			let options = {
				filter: {
					value: [],
				},
				fromBlock: last + 1 // Don't sync last twice
			}
			
			this.shopContract.addedPaymentEntry(options)
			.on('error', (err: Error) => console.error(err))
			.on('data', (event: EventData) => { this.OnAddedPaymentEntry(event, this.shopContract, this.sql) })
			
			this.shopContract.paymentSettled(options)
			.on('error', (err: Error) => console.error(err))
			.on('data', (event: EventData) => { this.OnPaymentSettled(event, this.shopContract, this.sql) })

			this.shopContract.statusChange(options)
			.on('error', (err: Error) => console.error(err))
			.on('data', (event: EventData) => { this.OnStatusChange(event, this.shopContract, this.sql) })
		})
		.catch((err: Error) => {
			console.error(err)
		})
	}
	
	private OnAddedPaymentEntry(event: EventData, shopContract: ShopContract_Interface, sql: SQL_Interface): void {
		shopContract.getPaymentEntry(event.returnValues.paymentEntryId)
		.then((res: paymentEntry) => {
			sql.insertPaymentEntry({id: event.returnValues.paymentEntryId, seller: res.seller, price: res.price})
		})
		.then(() => {
			sql.setLastSyncBlock(event.blockNumber);
		})
		.catch((err: Error) => {
			console.error(err)
		})
	}
	
	private OnPaymentSettled(event: EventData, shopContract: ShopContract_Interface, sql: SQL_Interface): void {
		shopContract.getSettledPayment(event.returnValues.settledPaymentId)
		.then(async (res: settledPayment)  => {
			let time = await this.shopContract.getBlockTime(event.blockNumber);
	
			sql.insertSettledPayment({
				id: event.returnValues.settledPaymentId,
				paymentEntryId: res.paymentEntryId,
				client: res.client,
				status: res.status,
				created: time,
				confirmed: null
			})
		})
		.then(() => {
			sql.setLastSyncBlock(event.blockNumber);
		})
		.catch((err: Error) => {
			console.error(err)
		})
	}

	private OnStatusChange(event: EventData, shopContract: ShopContract_Interface, sql: SQL_Interface): void {
		shopContract.getSettledPayment(event.returnValues.settledPaymentId)
		.then(async (res: settledPayment) => {
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