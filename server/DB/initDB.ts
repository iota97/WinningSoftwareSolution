import {db} from "./connection";
import {syncDB} from "../contract/syncDB";

export const initDB = () => {
	db.query("CREATE TABLE IF NOT EXISTS PaymentEntry (id varchar(255), ecommerce varchar(255), primary key(id));", (err) => {
		if (err) {
			console.log(err);
			return;
		}
		db.query("CREATE TABLE IF NOT EXISTS SettledPayment (id varchar(255), acquirente varchar(255), primary key(id));", (err) => {
			if (err) {
				console.log(err);
				return;
			}
			syncDB();
		});
	});
};