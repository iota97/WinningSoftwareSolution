import express, {Request, Response} from "express";
import qr from "qrcode";
import {paymentEntry} from "../DB/types/paymentEntry";
import {settledPayment} from "../DB/types/settledPayment";
import * as paymentEntryModel from "../DB/paymentEntries";
import * as settledPaymentModel from "../DB/settledPayments";
import {shopContract} from "../contract/contract";

const PoCRounter = express.Router();

PoCRounter.get("/items", async (req: Request, res: Response) => {
  paymentEntryModel.findAll((err: Error, item: paymentEntry[]) => {
    if (err) {
      return res.status(500).json({"errorMessage": err.message});
    }
    
    let item_string: string = "";
    for (let i = 0; i < item.length; i++) {
      item_string +=
      "<a href=\"item?id="+ item[i].id +"\">ID: " + item[i].id + "</a>    " +
      "E-Commerce: " + item[i].ecommerce + "<br><br>";
    }
    res.render("items", {item: item_string});
  });
});

PoCRounter.get("/item", async (req: Request, res: Response) => {
  shopContract.methods.getPaymentEntry(req.query.id).call((err: Error, item: any) => {
    if (err) {
      console.log(err);
    } else {
      res.render("item", {seller: item.seller, objId: item.objId, price: item.price});
    }
  });
});

PoCRounter.get("/transazioni", async (req: Request, res: Response) => {
  settledPaymentModel.findAll((err: Error, item: settledPayment[]) => {
    if (err) {
      return res.status(500).json({"errorMessage": err.message});
    }
    
    let item_string: string = "";
    for (let i = 0; i < item.length; i++) {
      item_string +=
      "<a href=\"transazione?id="+ item[i].id +"\">ID: " + item[i].id + "</a>    " +
      "Acquirente: " + item[i].acquirente + "    " +
      "<a href=\"qr?id="+ item[i].id +"\">QR</a><br><br>";
    }
    res.render("transazioni", {item: item_string});
  });
});


PoCRounter.get("/transazione", async (req: Request, res: Response) => {
  shopContract.methods.getSettledPayment(req.query.id).call((err: Error, item: any) => {
    if (err) {
      console.log(err);
    } else {
      const stato = item.status == 0 ? "Cancellato" : item.status == 1 ? "In attesa" : "Sbloccato";
      res.render("transazione", {idTransazione: req.query.id, acquirente: item.client, paymentEntryId: item.paymentEntryId, status: stato});        
    }
  });
});

PoCRounter.get("/qr", async (req: Request, res: Response) => {
      /*
       TL;DR
       1) Metamask su android non permette di collegarsi direttamente a un server locale su Android in quanto l'HTTP non è permesso (CLEAR_TEXT_NOT_PERMITTED)
       2) Metamask ha un eccezione hardcoddata che lo permette per le connessioni provenienti da sslip.io (la documentazione dice di usare xip.io che non è sbagliato da agosto)
       3) PR per aggiornare la documentazione: https://github.com/MetaMask/metamask-docs/pull/396
       4) I deep link funzionano solo se in HTTPS, Android dalla versione 7 non permette di aggiungere certificati senza ricompilare l'app
       5) Creiamo un link HTTPS a tinyurl, che punta a sslip.io con nostro server locale in HTTP, i.e: http://192.168.0.15.sslip.io:8080/PoC/transazione
       6) Notare come tinyurl è uno dei pochi shortener che permette parametri in GET
       7) Creiamo il nostro bel QR così finchè non avremo un server HTTPS in produzione con dei certificati veri
       8) TODO: investigare l'utilizzo di "ngrok" per un tunneling HTTPS, ma probabilemente non ne vale la pena
       9) In produzione sarà compito dei sistemisti configurare il traffico HTTP in uscita dal server per essere in HTTPS
    */
      const qr_str = "https://metamask.app.link/dapp/" + "tinyurl.com/" + process.env.TINYURL + "?id=" + req.query.id;
      qr.toDataURL(qr_str, (err, src) => {
        if (err) res.send("Error occured in QR");
        res.render("QR", {qr_img:src});
      }); 
});


PoCRounter.get("/", async (req: Request, res: Response) => {
  res.render("PoC");
});

export {PoCRounter};