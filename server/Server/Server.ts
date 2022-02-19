import express, {Request, Response, Express} from "express";
import path from 'path';
import bodyParser from 'body-parser';
import qr from "qrcode";
import { Persistence } from "../Persistence/Persistence"

class Server {
    private app: Express;
    private listener: any;
    private db: Persistence;
    
    public constructor(db: Persistence) {
        this.db = db
        
        this.app = express();
        
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.set("view engine", "ejs");
        
        this.initRoutes();
    }
    
    public close() {
        this.listener.close();
    }
    
    private initRoutes() {
        this.app.use(express.static(path.join(__dirname, "../public")));
        
        this.app.get("/", this.MainPage);
        this.app.get("/qr", this.QRPage);
        this.app.get("/confirm", (req: Request, res: Response) => { this.confirmPage(req, res, this.db) });
        this.app.get("/buyer", (req: Request, res: Response) => { this.paymentByBuyerPage(req, res, this.db) });
        this.app.get("/seller", (req: Request, res: Response) => { this.paymentBySellerPage(req, res, this.db) });
        this.app.get("/land", (req: Request, res: Response) => { this.landPage(req, res, this.db) });
    }
    
    public landPage(req: any, res: any, db: Persistence) {
        db.getPaymentEntryByID(req.query.id)
        .then((item: any) => {
            res.render("land", {
                serverURL: process.env.SERVER_URL + "land?id=" + req.query.id,
                seller: item.seller,
                price: item.price,
                id: req.query.id
            });
        })
        .catch(() => {
            res.redirect('/')
        })
    }
    
    public MainPage(req: any, res: any) {
        res.render("main", {serverURL: process.env.SERVER_URL});
    }
    
    public QRPage(req: any, res: any) {
        const qr_str = "https://metamask.app.link/dapp/" +  process.env.SERVER_URL + "/confirm?id=" + req.query.id;
        qr.toDataURL(qr_str)
        .then((src) => {
            res.render("QR", {serverURL: process.env.SERVER_URL, qr_img: src});
        })
    }
    
    public confirmPage(req: any, res: any, db: Persistence) {
        db.getPaymentByID(req.query.id)
        .then((item: any) => {
            res.render("confirm", {
                serverURL: process.env.SERVER_URL,
                id: item.id,
                seller: item.seller,
                price: item.price,
                status: item.status,
                buyer: item.buyer
            });
        })    
        .catch(() => {
            res.redirect('/')
        })
    }
    
    private timeConverter(timestamp: string){
        if (timestamp == "") {
            return "N/A"
        }
        var a = new Date(Number(timestamp)*1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
        return time;
    }

    public paymentByBuyerPage(req: any, res: any, db: Persistence) {
        db.getPaymentByBuyer(req.query.id)
        .then((items: any) => {
            let item_string: string = "<table>";
            for (let i = 0; i < items.length; i++) {
                item_string +=
                "<tr><td>Venditore: " + items[i].seller + "</td>" +
                "<td>Prezzo: " + items[i].price + "</td>" +
                "<td>Data creazione: " + this.timeConverter(items[i].created) + "</td>" +
                "<td>Data conferma/annullamento: " + this.timeConverter(items[i].confirmed) + "</td>" +
                "<td>Stato: " + items[i].status + "</td></tr>"
            }
            item_string += "</table>";
            
            if (items.length == 0) {
                item_string = "<div>Nessuna transazione trovata</div>"
            }
            res.render("buyer", {items: item_string});
        })
        .catch(() => {
            res.redirect('/')
        })
    }
    
    public paymentBySellerPage(req: any, res: any, db: Persistence) {
        db.getPaymentBySeller(req.query.id)
        .then((items: any) => {
            let item_string: string = "<table>";
            for (let i = 0; i < items.length; i++) {
                item_string +=
                "<tr><td>Acquirente: " + items[i].seller + "</td>" +
                "<td>Prezzo: " + items[i].price + "</td>" +
                "<td><a href=\"confirm?id="+items[i].id+"\">Stato: " + items[i].status + "</a></td>" +
                "<td><a href=\"qr?id="+items[i].id+"\">Genera QR</a></td></tr>"
            }
            item_string += "</table>";
            
            if (items.length == 0) {
                item_string = "<div>Nessuna transazione trovata</div>"
            }
            res.render("buyer", {items: item_string});
        })
        .catch(() => {
            res.redirect('/')
        })
    }
    
    public listen() {
        this.listener = this.app.listen(process.env.PORT, () => {
            console.log(`[server]: Server is running at https://localhost:${process.env.PORT}`);
        });
    }  
}

export { Server }