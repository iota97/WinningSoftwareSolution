import { PastEventOptions } from "web3-eth-contract"
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