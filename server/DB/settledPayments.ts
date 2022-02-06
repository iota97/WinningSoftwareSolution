import {settledPayment} from "./types/settledPayment";
import {db} from "./connection";
import { OkPacket, RowDataPacket } from "mysql2";

export const create = (pagamento: settledPayment, callback: Function) => {
  const queryString = "INSERT IGNORE INTO SettledPayment (id, acquirente) VALUES (?, ?)"

  db.query(
    queryString,
    [pagamento.id, pagamento.acquirente],
    (err, result) => {
      if (err) {callback(err)};

      const insertId = (<OkPacket> result).insertId;
      callback(null, insertId);
    }
  );
};

export const findAll = (callback: Function) => {
  const queryString = `SELECT * FROM SettledPayment`

  db.query(queryString, (err, result) => {
    if (err) {callback(err)}

    const rows = <RowDataPacket[]> result;
    const pagamenti: settledPayment[] = [];

    rows.forEach(row => {
      const pagamento: settledPayment =  {
	id: row.id,
        acquirente: row.acquirente,
      }

      pagamenti.push(pagamento);
    });
    callback(null, pagamenti);
  });
}