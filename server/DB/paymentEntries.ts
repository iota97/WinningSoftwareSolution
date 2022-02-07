import {paymentEntry} from "./types/paymentEntry";
import {db} from "./connection";
import { OkPacket, RowDataPacket } from "mysql2";

export const create = (pagamento: paymentEntry, callback: Function) => {
  const queryString = "INSERT IGNORE INTO PaymentEntry (id, ecommerce) VALUES (?, ?)"
  
  db.query(
    queryString,
    [pagamento.id, pagamento.ecommerce],
    (err, result) => {
      if (err) {
        callback(err); 
        return;
      }
      
      const insertId = (<OkPacket> result).insertId;
      callback(null, insertId);
    }
    );
  };
  
  export const findAll = (callback: Function) => {
    const queryString = `SELECT * FROM PaymentEntry`
    
    db.query(queryString, (err, result) => {
      if (err) {callback(err)}
      
      const rows = <RowDataPacket[]> result;
      const pagamenti: paymentEntry[] = [];
      
      rows.forEach(row => {
        const pagamento: paymentEntry =  {
          id: row.id,
          ecommerce: row.ecommerce,
        }
        pagamenti.push(pagamento);
      });
      callback(null, pagamenti);
    });
  }