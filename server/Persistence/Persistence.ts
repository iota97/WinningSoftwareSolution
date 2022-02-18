import { SQL } from "./SQL"
import { ShopContract } from "./ShopContract"

class Persistence {
	private static instance: Persistence;

	private constructor() {	
		ShopContract.get().hookEvent()
	}

	public static get(): Persistence {
		if (!Persistence.instance) {
			Persistence.instance = new Persistence()
		}

		return Persistence.instance
	}

	public getPaymentByBuyer(buyer: string) {
		return SQL.get().getPaymentByBuyer(buyer)
	}

	public getPaymentBySeller(seller: string) {
		return SQL.get().getPaymentBySeller(seller)
	}

	public getPaymentEntryPrice(id: bigint) {
		return SQL.get().getPaymentEntryPrice(id)
	}
}

export { Persistence }