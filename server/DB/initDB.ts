import {db} from "./connection";
import {Presistence} from "../Persistence/Persistence";

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
			db.query("CREATE TABLE IF NOT EXISTS LastBlockSync (id int(1), value int(255), primary key(id));", (err) => {
				if (err) {
					console.log(err);
					return;
				}
				db.query("INSERT IGNORE INTO LastBlockSync (id, value) VALUES (0, 0);", (err) => {
					if (err) {
						console.log(err);
						return;
					}
					Presistence.get();
				});
			});
		});
	});
};
