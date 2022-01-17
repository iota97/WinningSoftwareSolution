import {transazione} from "./types/transazione";
import {db} from "../db";
import { OkPacket, RowDataPacket } from "mysql2";

export const create = (t: transazione, callback: Function) => {
  const queryString = "INSERT INTO Transazioni (id, ecommerce_id, prodotto_id) VALUES (?, ?, ?)"

  db.query(
    queryString,
    [t.id, t.ecommerce, t.idProdotto],
    (err, result) => {
      if (err) {callback(err)};

      const insertId = (<OkPacket> result).insertId;
      callback(null, insertId);
    }
  );
};

export const findOne = (id: number, callback: Function) => {
  const queryString = `SELECT * FROM Transazioni WHERE id=?`

  db.query(queryString, id, (err, result) => {
    if (err) {callback(err)}

    const rows = <RowDataPacket[]> result;
    const transazioni: transazione[] = [];

    rows.forEach(row => {
      const t: transazione =  {
	id: row.id,
        ecommerce: row.ecommerce_id,
        idProdotto: row.prodotto_id
      }
      transazioni.push(t);
    });
    callback(null, transazioni);

  });
}

export const findAll = (callback: Function) => {
  const queryString = `SELECT * FROM Transazioni`

  db.query(queryString, (err, result) => {
    if (err) {callback(err)}

    const rows = <RowDataPacket[]> result;
    const transazioni: transazione[] = [];

    rows.forEach(row => {
      const t: transazione =  {
	id: row.id,
        ecommerce: row.ecommerce_id,
        idProdotto: row.prodotto_id
      }
      transazioni.push(t);
    });
    callback(null, transazioni);
  });
}

export const update = (t: transazione, callback: Function) => {
  const queryString = `UPDATE Transazioni SET ecommerce_id=?, prodotto_id=? WHERE id=?`;
  db.query(
    queryString,
    [t.ecommerce, t.idProdotto, t.id],
    (err, result) => {
      if (err) {callback(err)}
      callback(null);
    }
  );
}