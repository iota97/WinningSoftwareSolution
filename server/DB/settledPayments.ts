import {settledEntry} from "./types/settledEntry";
import {db} from "./connection";
import { OkPacket, RowDataPacket } from "mysql2";

export const create = (pagamento: settledEntry, callback: Function) => {
  const queryString = "INSERT INTO settledEntry (id, acquirente) VALUES (?, ?)"

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

export const findOne = (id: string, callback: Function) => {
  const queryString = `SELECT * FROM settledEntry WHERE id=?`
  db.query(queryString, id, (err, result) => {
    if (err) {callback(err)}

    const rows = <RowDataPacket[]> result;
    const pagamenti: settledEntry[] = [];

    rows.forEach(row => {
      const pagamento: settledEntry =  {
	id: row.id,
        ecommerce: row.acquirente,
      }
      pagamenti.push(pagamento);
    });
    callback(null, pagamenti);

  });
}

export const findAll = (callback: Function) => {
  const queryString = `SELECT * FROM settledEntry`

  db.query(queryString, (err, result) => {
    if (err) {callback(err)}

    const rows = <RowDataPacket[]> result;
    const pagamenti: settledEntry[] = [];

    rows.forEach(row => {
      const pagamento: settledEntry =  {
	id: row.id,
        ecommerce: row.aquirente,
      }
      pagamenti.push(pagamento);
    });
    callback(null, pagamenti);
  });
}