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

	public getSettlePaymentByBuyer() {

	}

	public getSettlePaymentBySeller() {

	}
	
	public getPaymentEntryPrice() {

	}
}

export { Presistence }