import express, {Request, Response} from "express";
import qr from "qrcode";
import * as transazioniModel from "../DB/paymentEntries";
import {paymentEntry} from "../DB/types/paymentEntry";

const PoCRounter = express.Router();

PoCRounter.get("/", async (req: Request, res: Response) => {
  transazioniModel.findAll((err: Error, transazioni: paymentEntry[]) => {
    if (err) {
      return res.status(500).json({"errorMessage": err.message});
    }
    
    let transazioni_string: string = "";
    for (let i = 0; i < transazioni.length; i++) {
      transazioni_string += 
      "<a href=\"PoC/transazione?id="+ transazioni[i].id +"\">ID: " + transazioni[i].id + "</a>    " + 
      "E-Commerce: " + transazioni[i].ecommerce + "    " +
      "<a href=\"PoC/qr?id="+ transazioni[i].id +"\">QR</a><br><br>";
    }

    res.render("PoC", {transazioni:transazioni_string});
  });
});

PoCRounter.get("/qr", async (req: Request, res: Response) => {
    /* 
       TL;DR
       1) Metamask su android non permette di collegarsi direttamente a un server locale senza passare per un DNS
       2) sslip.io (perchè quello indicato sulla loro documentazione ufficiale neanche esiste più da un bel po') ci fa da DNS
       3) Ora i deep link funzionano solo se in HTTPS, Android dalla versione 7 non permette di aggiungere certificati senza ricompilare l'app
       4) Creiamo un link HTTPS a tinyurl, che punta a sslip.io con nostro server locale in HTTP, i.e: http://192.168.0.15.sslip.io:8080/PoC/transazione
       5) Notare come tinyurl è uno dei pochi shortener che permette parametri in GET
       6) Creiamo il nostro bel QR così finchè non avremo un server HTTPS in produzione con dei certificati veri
    */

    const qr_str = "https://metamask.app.link/dapp/" + "tinyurl.com/2p9xf7wx" + "?id=" + req.query.id;
    qr.toDataURL(qr_str, (err, src) => {
        if (err) res.send("Error occured in QR");
            res.render("QR", {qr_img:src});
    });
});

PoCRounter.post("/", async (req: Request, res: Response) => {
  const newTransazione: paymentEntry = req.body;
  transazioniModel.create(newTransazione, (err: Error, id: string) => {
    if (err) {
      return res.status(500).json({"message": err.message});
    }
      
    res.redirect('/PoC');
  });
});

PoCRounter.get("/transazione", async (req: Request, res: Response) => {
  const orderId: any = req.query.id;
  transazioniModel.findOne(orderId, (err: Error, pagamento: paymentEntry) => {
    if (err) {
      return res.status(500).json({"message": err.message});
    }
    res.status(200).json({"data": pagamento});
  })
});

export {PoCRounter};