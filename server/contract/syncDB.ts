import {shopContract} from "./contract";
import * as paymentEntryModel from "../DB/paymentEntries";
import * as settledPaymentModel from "../DB/settledPayments";
import * as lastBlockModel from "../DB/lastBlock";

const updateLastBlock = (block: number) => {
	lastBlockModel.setLast(block, function(){ console.log("Synced to block (if newer): " + block) });
}

const OnAddedPaymentEntry = (event: any) => {
	shopContract.methods.getPaymentEntry(event.returnValues.paymentEntryId).call((err: Error, res: any) => {
		if (err) {
			console.log(err);
		} else {
			paymentEntryModel.create({id: event.returnValues.paymentEntryId, ecommerce: res.seller}, (err: Error, id: string) => {
				if (err) {
					console.log(err);
				}
				updateLastBlock(event.blockNumber);
			})
		}
	})
}

const OnPaymentSettled = (event: any) => {
	shopContract.methods.getSettledPayment(event.returnValues.settledPaymentId).call((err: Error, res: any) => {
		if (err) {
			console.log(err);
		} else {
			settledPaymentModel.create({id: event.returnValues.settledPaymentId, acquirente: res.client}, (err: Error, id: string) => {
				if (err) {
					console.log(err);
				}
				updateLastBlock(event.blockNumber);
			})
		}
	})
}


export const syncDB = () => {
	//spiegone @ https://www.coinclarified.com/p/3-ways-to-subscribe-to-events-with-web3-js/
	lastBlockModel.getLast((err: Error, last: any) => {
		let options = {
			filter: {
				value: [],
			},
			fromBlock: last
		};
		console.log("Last block synced was: "+last);
		
		shopContract.events.addedPaymentEntry(options)
		.on('error', (err: Error) => console.log(err))
		.on('data', OnAddedPaymentEntry);
		
		shopContract.events.paymentSettled(options)
		.on('error', (err: Error) => console.log(err))
		.on('data', OnPaymentSettled);
	});
}