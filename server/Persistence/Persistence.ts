import { SQL_Interface } from "./SQL_Interface"
import { payment } from "./Types/payment"
import { paymentEntry } from "./Types/paymentEntry"
import { ShopContractEventManager } from "./ShopContractEventManager"
import { ShopContract_Interface } from '../Persistence/ShopContract_Interface';

class Persistence {
	private sql: SQL_Interface;

	public constructor(sql: SQL_Interface, shopContract: ShopContract_Interface) {	
		this.sql = sql;
		new ShopContractEventManager(sql, shopContract)
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