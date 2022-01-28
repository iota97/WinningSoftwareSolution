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
      "<a href=\"PoC/"+ transazioni[i].id +"\">ID: " + transazioni[i].id + "    " + 
      "E-Commerce: " + transazioni[i].ecommerce + "    " +
      "Prodotto: " + transazioni[i].idProdotto + "</a><br><br>";
    }

    const qr_str: any = req.query.qr || "Default";
    qr.toDataURL(qr_str, (err, src) => {
        if (err) res.send("Error occured in QR");
            res.render("PoC", {transazioni:transazioni_string, qr_img:src});
    });
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

PoCRounter.get("/:id", async (req: Request, res: Response) => {
  const orderId: number = Number(req.params.id);
  transazioniModel.findOne(orderId, (err: Error, t: transazione) => {
    if (err) {
      return res.status(500).json({"message": err.message});
    }
    res.status(200).json({"data": t});
  })
});

export {PoCRounter};