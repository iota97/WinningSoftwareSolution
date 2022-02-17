import { Connection } from "mysql2";
import mysql from "mysql2";
import { ShopContract } from "./ShopContract"

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
		
		this.noResultQuery("CREATE TABLE IF NOT EXISTS PaymentEntry (id varchar(255), ecommerce varchar(255), primary key(id));")
		.then(() => {
			this.noResultQuery("CREATE TABLE IF NOT EXISTS SettledPayment (id varchar(255), acquirente varchar(255), primary key(id));")
		}).then(() => {
			this.noResultQuery("CREATE TABLE IF NOT EXISTS LastBlockSync (id int(1), value int(255), primary key(id));")
		}).then(() => {
			this.noResultQuery("INSERT IGNORE INTO LastBlockSync (id, value) VALUES (0, 0);")
		}).then(() => {
			ShopContract.get().hookEvent()
		}).catch((err: Error) => {
			console.error(err)
		})
	}
	
	public static get(): SQL {
		if (!SQL.instance) {
			SQL.instance = new SQL();
		}
		
		return SQL.instance;
	}
	
	private noResultQuery(query: string) {
		return new Promise<void>((resolve, reject) => {
			this.db.query(query, (err, result) => {
				if (err) {
					reject(err)
				}
				
				resolve()
			})
		})
	}
	
	public getLastSyncBlock() {
		return new Promise((resolve, reject) => {
			const queryString = `SELECT value FROM LastBlockSync WHERE id=0`
			
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
		return new Promise<void>((resolve, reject) => {
			const queryString = `UPDATE LastBlockSync SET value=? WHERE id=0 AND value<?`
			
			this.db.query(queryString, [block, block], (err, result) => {
				if (err) {
					reject(err)
				}
				
				console.log("Synced to block (if newer): " + block)
				resolve()
			})
		})
	}
}

export { SQL }