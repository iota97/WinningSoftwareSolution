import express, {Request, Response} from "express";
import * as transazioniModel from "../DB/transazioni";
import {transazione} from "../DB/types/transazione";
const transazioniRouter = express.Router();

transazioniRouter.get("/", async (req: Request, res: Response) => {
  transazioniModel.findAll((err: Error, transazioni: transazione[]) => {
    if (err) {
      return res.status(500).json({"errorMessage": err.message});
    }

    res.status(200).json({"data": transazioni});
  });
});

transazioniRouter.post("/", async (req: Request, res: Response) => {
  const newTransazione: transazione = req.body;
  transazioniModel.create(newTransazione, (err: Error, id: number) => {
    if (err) {
      return res.status(500).json({"message": err.message});
    }

    res.status(200).json({"id": id});
  });
});

transazioniRouter.get("/:id", async (req: Request, res: Response) => {
  const orderId: number = Number(req.params.id);
  transazioniModel.findOne(orderId, (err: Error, t: transazione) => {
    if (err) {
      return res.status(500).json({"message": err.message});
    }
    res.status(200).json({"data": t});
  })
});

transazioniRouter.put("/:id", async (req: Request, res: Response) => {
  const t: transazione = req.body;
  transazioniModel.update(t, (err: Error) => {
    if (err) {
      return res.status(500).json({"message": err.message});
    }

    res.status(200).send();
  })
});

export {transazioniRouter};