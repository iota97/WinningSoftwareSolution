import { Connection } from "mysql2";
import mysql from "mysql2";
import { ShopContract } from "./ShopContract"
import { payment } from "./Types/payment";
import { paymentEntry } from "./Types/paymentEntry";
import { settledPayment } from "./Types/settledPayment";


class SQL {
	private static instance: SQL;
	private db: Connection;
	
	private constructor() {		
		this.db = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PWD,
			database: process.env.DB_NAME
		})
	}
	
	public init() {
		return new Promise((resolve, reject) => {			
			this.noResultQuery("CREATE TABLE IF NOT EXISTS PaymentEntries (id bigint, ecommerce varchar(255), price bigint, primary key(id));")
			.then(() => {
				this.noResultQuery("CREATE TABLE IF NOT EXISTS SettledPayments (id bigint, item_id bigint, buyer varchar(255), status int, primary key(id));")
			}).then(() => {
				this.noResultQuery("CREATE TABLE IF NOT EXISTS LastBlockSynced (id int(1), value bigint, primary key(id));")
			}).then(() => {
				this.noResultQuery("INSERT IGNORE INTO LastBlockSynced (id, value) VALUES (0, 0);")
			}).then(() => {
				ShopContract.get().hookEvent()
				resolve(null)
			}).catch((err: Error) => {
				reject(err)
			})
		})
	}
	
	public static get(): SQL {
		if (!SQL.instance) {
			SQL.instance = new SQL();
		}

		await SQL.instance.init()
		return SQL.instance
	}
	
	public insertPaymentEntry(entry: paymentEntry) {
		return new Promise((resolve, reject) => {
			const queryString = "INSERT IGNORE INTO PaymentEntries (id, ecommerce, price) VALUES (?, ?, ?)"
			
			this.db.query(queryString, [entry.id, entry.ecommerce, entry.price], (err, result) => {
				if (err) {
					reject(err)
				}
				
				resolve(null)
			})
		})
	}
	
	public insertSettledPayment(entry: settledPayment) {
		return new Promise((resolve, reject) => {
			const queryString = "INSERT IGNORE INTO SettledPayments (id, item_id, buyer, status) VALUES (?, ?, ?, ?)"
			
			this.db.query(queryString, [entry.id, entry.item_id, entry.buyer, entry.status], (err, result) => {
				if (err) {
					reject(err)
				}
				
				resolve(null)
			})
		})
	}
	
	public getPaymentByBuyer(buyer: string) {
		return new Promise((resolve, reject) => {
			const queryString = `SELECT buyer, ecommerce, price, status FROM SettledPayments S JOIN PaymentEntries E ON E.id=S.item_id WHERE S.buyer=?`
			
			this.db.query(queryString, buyer, (err, result) => {
				if (err) {
					reject(err)
				}
				
				const rows = <mysql.RowDataPacket[]> result;
				const payments: payment[] = [];
				
				rows.forEach(row => {
					const payment: payment =  {
						buyer: row.buyer,
						seller: row.ecommerce,
						price: row.price,
						status: row.status
					}
					payments.push(payment)
				});
				
				resolve(payments)
			})
		})	
	}
	
	public getPaymentBySeller(seller: string) {
		return new Promise((resolve, reject) => {
			const queryString = `SELECT buyer, ecommerce, price, status FROM SettledPayments S JOIN PaymentEntries E ON E.id=S.item_id WHERE E.ecommerce=?`
			
			this.db.query(queryString, seller, (err, result) => {
				if (err) {
					reject(err)
				}
				
				const rows = <mysql.RowDataPacket[]> result;
				const payments: payment[] = [];
				
				rows.forEach(row => {
					const payment: payment =  {
						buyer: row.buyer,
						seller: row.ecommerce,
						price: row.price,
						status: row.status
					}
					payments.push(payment)
				});
				
				resolve(payments)
			})
		})	
	}
	
	public getPaymentEntryPrice(id: bigint) {
		return new Promise((resolve, reject) => {
			const queryString = `SELECT price FROM PaymentEntries WHERE id=?`
			
			this.db.query(queryString, id.toString(), (err, result) => {
				if (err) {
					reject(err)
				}
				
				const rows = <mysql.RowDataPacket[]> result;
				resolve(rows[0].price)
			})
		})
	}
	
	private noResultQuery(query: string) {
		return new Promise((resolve, reject) => {
			this.db.query(query, (err, result) => {
				if (err) {
					reject(err)
				}
				
				resolve(null)
			})
		})
	}
	
	public getLastSyncBlock() {
		return new Promise((resolve, reject) => {
			const queryString = `SELECT value FROM LastBlockSynced WHERE id=0`
			
			this.db.query(queryString, (err, result) => {
				if (err) {
					reject(err)
				}
				
				const rows = <mysql.RowDataPacket[]> result;
				resolve(rows[0].value)
			})
		})
	}
	
	public setLastSyncBlock(block: bigint) {
		return new Promise((resolve, reject) => {
			const queryString = `UPDATE LastBlockSynced SET value=? WHERE id=0 AND value<?`
			
			this.db.query(queryString, [block, block], (err, result) => {
				if (err) {
					reject(err)
				}
				
				console.log("Synced to block (if newer): " + block)
				resolve(null)
			})
		})
	}
}

export { SQL }