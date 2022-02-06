import {shopContract} from "./contract";
import {paymentEntry} from "../DB/types/paymentEntry";
import {settledPayment} from "../DB/types/settledPayment";
import * as paymentEntryModel from "../DB/paymentEntries";
import * as settledPaymentModel from "../DB/settledPayments";

// TODO: fromBlock
let options = {
    filter: {
        value: [],
    },
    fromBlock: 0
};

export const syncDB = () => {
	//spiegone @ https://www.coinclarified.com/p/3-ways-to-subscribe-to-events-with-web3-js/
	shopContract.events.addedPaymentEntry(options)
	    .on('error', (err: Error) => console.log(err))
	    .on('data', (event: any) => {
		shopContract.methods.getPaymentEntry(event.returnValues.paymentEntryId).call((err: Error, res: any) => {
			if (err) {
				console.log(err);
			} else {
				paymentEntryModel.create({id: event.returnValues.paymentEntryId, ecommerce: res.seller}, (err: Error, id: string) => {
					if (err) {
						console.log(err);
					}
				})
			}
		})
	});

	shopContract.events.paymentSettled(options)
	    .on('error', (err: Error) => console.log(err))
	    .on('data', (event: any) => {
		shopContract.methods.getSettledPayment(event.returnValues.settledPaymentId).call((err: Error, res: any) => {
			if (err) {
				console.log(err);
			} else {
				settledPaymentModel.create({id: event.returnValues.settledPaymentId, acquirente: res.client}, (err: Error, id: string) => {
					if (err) {
						console.log(err);
					}
				})
			}
		})
	});
};