import express, {Request, Response} from "express";
import qr from "qrcode";
import * as transazioniModel from "../DB/transazioni";
import {transazione} from "../DB/types/transazione";

const PoCRounter = express.Router();

PoCRounter.get("/", async (req: Request, res: Response) => {
  transazioniModel.findAll((err: Error, transazioni: transazione[]) => {
    if (err) {
      return res.status(500).json({"errorMessage": err.message});
    }
    
    let transazioni_string: string = "";
    for (let i = 0; i < transazioni.length; i++) {
      transazioni_string += 
      "<a href=\"PoC/transazione?id="+ transazioni[i].id +"\">ID: " + transazioni[i].id + "</a>    " + 
      "E-Commerce: " + transazioni[i].ecommerce + "    " +
      "Prodotto: " + transazioni[i].idProdotto + "    " +
      "<a href=\"PoC/qr?id="+ transazioni[i].id +"\">QR</a><br><br>";
    }

    res.render("PoC", {transazioni:transazioni_string});
  });
});

PoCRounter.get("/qr", async (req: Request, res: Response) => {
    // http://192.168.0.15.sslip.io:8080/PoC/transazione
    const qr_str = "https://metamask.app.link/dapp/" + "tinyurl.com/2p9xf7wx" + "?id=" + req.query.id;
    qr.toDataURL(qr_str, (err, src) => {
        if (err) res.send("Error occured in QR");
            res.render("QR", {qr_img:src});
    });
});

PoCRounter.post("/", async (req: Request, res: Response) => {
  const newTransazione: transazione = req.body;
  if (req.body.add) {
    transazioniModel.create(newTransazione, (err: Error, id: number) => {
      if (err) {
        return res.status(500).json({"message": err.message});
      }
      
      res.redirect('/PoC');
    });
  } else if (req.body.del) {
    transazioniModel.remove(req.body.id, (err: Error, id: number) => {
      if (err) {
        return res.status(500).json({"message": err.message})
      }

      res.redirect('/PoC');
    });
  }
});

PoCRounter.get("/transazione", async (req: Request, res: Response) => {
  const orderId: number = Number(req.query.id);
  transazioniModel.findOne(orderId, (err: Error, t: transazione) => {
    if (err) {
      return res.status(500).json({"message": err.message});
    }
    res.status(200).json({"data": t});
  })
});

export {PoCRounter};