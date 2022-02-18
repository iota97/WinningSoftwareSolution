import { SQL_Interface } from "./SQL"

class Persistence {
	private sql: SQL_Interface;

	public constructor(sql: SQL_Interface) {	
		this.sql = sql;
	}

	public getPaymentByBuyer(buyer: string) {
		return this.sql.getPaymentByBuyer(buyer)
	}

	public getPaymentBySeller(seller: string) {
		return this.sql.getPaymentBySeller(seller)
	}

	public getPaymentEntryPrice(id: bigint) {
		return this.sql.getPaymentEntryPrice(id)
	}
}

export { Persistence }