import { Connection } from "mysql2";
import mysql from "mysql2";
import { payment } from "./Types/payment";
import { paymentEntry } from "./Types/paymentEntry";
import { settledPayment } from "./Types/settledPayment";

export interface SQL_Interface {
	insertPaymentEntry: (entry: paymentEntry) => void;
	insertSettledPayment: (entry: settledPayment) => void;
	updateSettledPayment: (id: bigint, status: number, timestamp: string) => void;
	getPaymentByBuyer: (buyer: string) => Promise<payment[]>;
	getPaymentBySeller: (seller: string) => Promise<payment[]>;
	getPaymentByID: (id: bigint) => Promise<payment>;
	getPaymentEntryByID: (id: bigint) => Promise<paymentEntry>;
	setLastSyncBlock: (block: bigint) => void;
	getLastSyncBlock: () => Promise<number>;
}

export class SQL implements SQL_Interface {
	private db: Connection;
	
	public constructor() {
		this.db = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PWD,
			database: process.env.DB_NAME
		})
	}
	
	public closeConnection() {
		this.db.end()
	}
	
	public insertPaymentEntry(entry: paymentEntry) {
		return new Promise((resolve, reject) => {
			const queryString = "INSERT INTO PaymentEntries (id, ecommerce, price) VALUES (?, ?, ?)"
			
			this.db.query(queryString, [entry.id, entry.seller, entry.price], (err, result) => {
				if (err) {
					return reject(err)
				}
				
				resolve(null)
			})
		})
	}
	
	public insertSettledPayment(entry: settledPayment) {
		return new Promise((resolve, reject) => {
			const queryString = "INSERT INTO SettledPayments (id, item_id, buyer, status, created, confirmed) VALUES (?, ?, ?, ?, ?, ?)"
			this.db.query(queryString, [entry.id, entry.item_id, entry.buyer, entry.status, entry.created, entry.confirmed], (err, result) => {
				if (err) {
					return reject(err)
				}
				
				resolve(null)
			})
		})
	}
	
	public updateSettledPayment(id: bigint, status: number, timestamp: string) {
		return new Promise((resolve, reject) => {
			const queryString = "UPDATE SettledPayments set status=?, confirmed=? WHERE id=?"
			
			this.db.query(queryString, [status, timestamp, id], (err, result) => {
				if (err) {
					return reject(err)
				}
				
				resolve(null)
			})
		})
	}
	
	public getPaymentByBuyer(buyer: string) {
		return new Promise<payment[]>((resolve, reject) => {
			const queryString = `SELECT S.id, buyer, ecommerce, price, status, created, confirmed FROM SettledPayments S JOIN PaymentEntries E ON E.id=S.item_id WHERE S.buyer=?`
			
			this.db.query(queryString, buyer, (err, result) => {
				if (err) {
					return reject(err)
				}
				
				const rows = <mysql.RowDataPacket[]> result;
				const payments: payment[] = [];
				
				rows.forEach(row => {
					const payment: payment =  {
						id: row.id,
						buyer: row.buyer,
						seller: row.ecommerce,
						price: BigInt(row.price),
						status: row.status,
						created: row.created,
						confirmed: row.confirmed
					}
					payments.push(payment)
				});
				
				resolve(payments)
			})
		})	
	}
	
	public getPaymentBySeller(seller: string) {
		return new Promise<payment[]>((resolve, reject) => {
			const queryString = `SELECT S.id, buyer, ecommerce, price, status, created, confirmed FROM SettledPayments S JOIN PaymentEntries E ON E.id=S.item_id WHERE E.ecommerce=?`
			
			this.db.query(queryString, seller, (err, result) => {
				if (err) {
					return reject(err)
				}
				
				const rows = <mysql.RowDataPacket[]> result;
				const payments: payment[] = [];
				
				rows.forEach(row => {
					const payment: payment =  {
						id: row.id,
						buyer: row.buyer,
						seller: row.ecommerce,
						price: BigInt(row.price),
						status: row.status,
						created: row.created,
						confirmed: row.confirmed
					}
					payments.push(payment)
				});

				resolve(payments)
			})
		})	
	}
	
	public getPaymentEntryByID(id: bigint) {
		return new Promise<paymentEntry>((resolve, reject) => {
			const queryString = `SELECT * FROM PaymentEntries WHERE id=?`
			
			this.db.query(queryString, id.toString(), (err, result) => {
				if (err) {
					return reject(err)
				}
				
				const rows = <mysql.RowDataPacket[]> result;
				if (rows.length == 0) {
					return reject("No entry found")
				}
				
				const payment: paymentEntry = {
					id: rows[0].id,
					seller: rows[0].ecommerce,
					price: BigInt(rows[0].price)
				}
				
				resolve(payment)
			})
		})
	}
	
	public getPaymentByID(id: bigint) {
		return new Promise<payment>((resolve, reject) => {
			const queryString = `SELECT S.id, buyer, ecommerce, price, status, created, confirmed FROM SettledPayments S JOIN PaymentEntries E ON S.item_id=E.id WHERE S.id=?`
			
			this.db.query(queryString, id.toString(), (err, result) => {
				if (err) {
					return reject(err)
				}
				
				const rows = <mysql.RowDataPacket[]> result;
				if (rows.length == 0) {
					return reject("No entry found")
				}
				
				const payment: payment =  {
					id: rows[0].id,
					buyer: rows[0].buyer,
					seller: rows[0].ecommerce,
					price: BigInt(rows[0].price),
					status: rows[0].status,
					created: rows[0].created,
					confirmed: rows[0].confirmed
				}

				resolve(payment)
			})
		})
	}
	
	public getLastSyncBlock() {
		return new Promise<number>((resolve, reject) => {
			const queryString = `SELECT value FROM LastBlockSynced WHERE id=0`
			
			this.db.query(queryString, (err, result) => {
				if (err) {
					return reject(err)
				}
				
				const rows = <mysql.RowDataPacket[]> result;
				resolve(rows[0].value)
			})
		})
	}
	
	public setLastSyncBlock(block: bigint) {
		return new Promise<void>((resolve, reject) => {
			const queryString = `UPDATE LastBlockSynced SET value=? WHERE id=0`
			
			this.db.query(queryString, [block, block], (err, result) => {
				if (err) {
					return reject(err)
				}
				
				console.log("[sql]: Synced to block: " + block)
				resolve()
			})
		})
	}
}