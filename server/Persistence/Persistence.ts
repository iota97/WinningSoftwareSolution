import { SQL } from "./SQL"

class Presistence {
	private static instance: Presistence;
	private DB: SQL;

	private constructor() {	
		this.DB = SQL.get();
	}

	public static get(): Presistence {
		if (!Presistence.instance) {
			Presistence.instance = new Presistence();
		}

		return Presistence.instance;
	}

	public getPaymentByBuyer(buyer: string) {
		return this.DB.getPaymentByBuyer(buyer)
	}

	public getPaymentBySeller(seller: string) {
		return this.DB.getPaymentBySeller(seller)
	}

	public getPaymentEntryPrice(id: bigint) {
		return this.DB.getPaymentEntryPrice(id)
	}
}

export { Presistence }