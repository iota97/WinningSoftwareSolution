import { payment } from "./Types/payment";
import { paymentEntry } from "./Types/paymentEntry";
import { settledPayment } from "./Types/settledPayment";

export interface SQL_Interface {
	insertPaymentEntry: (entry: paymentEntry) => Promise<void>;
	insertSettledPayment: (entry: settledPayment) => Promise<void>;
	updateSettledPayment: (id: bigint, status: number, timestamp: bigint) => Promise<void>;
	getPaymentByBuyer: (buyer: string) => Promise<payment[]>;
	getPaymentBySeller: (seller: string) => Promise<payment[]>;
	getPaymentByID: (id: bigint) => Promise<payment>;
	getPaymentEntryByID: (id: bigint) => Promise<paymentEntry>;
	setLastSyncBlock: (block: number) => Promise<void>;
	getLastSyncBlock: () => Promise<number>;
}