import express, {Request, Response, Express} from "express";
import path from 'path';
import bodyParser from 'body-parser';
import qr from "qrcode";
import { Persistence } from "../Persistence/Persistence"

class Server {
    private app: Express;
    private db: Persistence;
    
    public constructor(db: Persistence) {
        this.db = db

        this.app = express();
        
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.set("view engine", "ejs");
        
        this.initRoutes();
    }
    
    private initRoutes() {
        this.app.use(express.static(path.join(__dirname, "../public")));
        
        this.app.get("/qr", this.QRPage);
        this.app.get("/", (req: Request, res: Response) => { this.paymentByBuyerPage(req, res, this.db) });
    }
    
    private QRPage(req: Request, res: Response) {
        const qr_str = "https://metamask.app.link/dapp/" +  process.env.SERVER_URL + "/transazione?id=" + req.query.id;
        qr.toDataURL(qr_str, (src) => {
            res.render("QR", {qr_img:src});
        })
    }
    
    private paymentByBuyerPage(req: Request, res: Response, db: Persistence) {
        db.getPaymentByBuyer("0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1")
        .then((items: any) => {
            let item_string: string = "<table>";
            for (let i = 0; i < items.length; i++) {
                item_string +=
                "<tr><td>Compratore: " + items[i].buyer + "</td>" +
                "<td>Venditore: " + items[i].seller + "</td>" +
                "<td>Prezzo: " + items[i].price + "</td>" +
                "<td>Stato: " + items[i].status + "</td></tr>"
            }
            item_string += "</table>";
            res.render("transazioni", {item: item_string});
        })
    }
    
    public listen() {
        this.app.listen(process.env.PORT, () => {
            console.log(`[server]: Server is running at https://localhost:${process.env.PORT}`);
        });
    }  
}

export { Server }