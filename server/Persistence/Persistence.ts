import { SQL_Interface } from "./SQL"
import { payment } from "./Types/payment"
import { paymentEntry } from "./Types/paymentEntry"

class Persistence {
	private sql: SQL_Interface;

	public constructor(sql: SQL_Interface) {	
		this.sql = sql;
	}

	public getPaymentByBuyer(buyer: string): Promise<payment[]> {
		return this.sql.getPaymentByBuyer(buyer)
	}

	public getPaymentBySeller(seller: string): Promise<payment[]> {
		return this.sql.getPaymentBySeller(seller)
	}

	public getPaymentByID(id: bigint): Promise<payment> {
		return this.sql.getPaymentByID(id)
	}

	public getPaymentEntryByID(id: bigint): Promise<paymentEntry> {
		return this.sql.getPaymentEntryByID(id)
	}
}

export { Persistence }