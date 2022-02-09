import {db} from "./connection";
import { OkPacket, RowDataPacket } from "mysql2";

export const setLast = (value: number, callback: Function) => {
  const queryString = `UPDATE LastBlockSync SET value=? WHERE id=0 AND value<?`

  db.query(
    queryString,
    [value, value],
    (err, result) => {
      if (err) {callback(err)};
      callback(null);
    }
  );
};

export const getLast = (callback: Function) => {
  const queryString = `SELECT value FROM LastBlockSync WHERE id=0`

  db.query(queryString, (err, result) => {
    if (err) {callback(err)}

    const rows = <RowDataPacket[]> result;
    callback(null, rows[0].value);
  });
}