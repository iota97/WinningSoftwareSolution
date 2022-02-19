import express, {Request, Response, Express} from "express";
import path from 'path';
import bodyParser from 'body-parser';
import qr from "qrcode";
import { Persistence } from "../Persistence/Persistence"
import internal from "stream";

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
        this.app.get("/confirm", (req: Request, res: Response) => { this.confirmPage(req, res, this.db) });
        this.app.get("/buyer", (req: Request, res: Response) => { this.paymentByBuyerPage(req, res, this.db) });
        this.app.get("/seller", (req: Request, res: Response) => { this.paymentBySellerPage(req, res, this.db) });
        this.app.get("/detail", (req: Request, res: Response) => { this.detailPage(req, res, this.db) });
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
            let item_string: string = "<ul class=\"transactions\">"
            for (let i = 0; i < items.length; i++) {
                item_string +=
                "<a href=\"detail?id="+items[i].id+"\">" +
                "<li class=\"stato"+items[i].status+"\">"+
                "<strong class=\"price\">" + items[i].price / Math.pow(10, 18) + " Matic</strong>" +
                "<span class=\"date\">" + this.timeConverter(items[i].created) + "</span>" +
                "</li>" +
                "</a>"
            }
            item_string += "</ul>";
            
            if (items.length == 0) {
                item_string = "<div>Nessuna transazione trovata</div>"
            }
            res.render("buyer", {items: item_string});
        })
        .catch(() => {
            res.redirect('/')
        })
    }
    
    public detailPage(req: any, res: any, db: Persistence) {
        db.getPaymentByID(req.query.id)
        .then((item: any) => {
            let status = "In transit";
            if (item.status == 2) {
                status = "Confirmed"
            } else if (item.status == 3) {
                status = "Cancelled"
            }
            let item_string: string =
            "<div class=\"info\">" +
            "<strong class=\"price\">Price " + item.price / Math.pow(10, 18) + " Matic</strong>" +
            "<span class=\"addr\">From: " + item.buyer + "</span>" +
            "<span class=\"addr\">To: " + item.seller + "</span>" +
            "<span class=\"date\">Opened " + this.timeConverter(item.created) + "</span>" +
            "<span class=\"date\">Closed " + this.timeConverter(item.confirmed) + "</span>" +
            "<span class=\"status\">" + status + "</span>" +
            "###QR###" +
            "<div>"
            
            if (req.query.s && item.status == 1) {
                const qr_url = "https://metamask.app.link/dapp/" +  process.env.SERVER_URL + "/confirm?id=" + req.query.id;
                qr.toDataURL(qr_url)
                .then((img_data) => {
                    const qr_str = "<a class=\"qr\" download=\"qr_"+item.id+".png\" href=\""+img_data+"\">Download QR</a>"
                    
                    item_string = item_string.replace("###QR###", qr_str);
                    res.render("detail", {item: item_string});
                })
            } else {
                item_string = item_string.replace("###QR###", "");
                res.render("detail", {item: item_string});
            }
        })
        
        .catch(() => {
            res.redirect('/')
        })
    }
    
    public paymentBySellerPage(req: any, res: any, db: Persistence) {
        db.getPaymentBySeller(req.query.id)
        .then((items: any) => {
            let item_string: string = "<ul class=\"transactions\">"
            for (let i = 0; i < items.length; i++) {
                item_string +=
                "<a href=\"detail?s=1&id="+items[i].id+"\">" +
                "<li class=\"stato"+items[i].status+"\">"+
                "<strong class=\"price\">" + items[i].price / Math.pow(10, 18) + " Matic</strong>" +
                "<span class=\"date\">" + this.timeConverter(items[i].created) + "</span>" +
                "</li>" +
                "</a>"
            }
            item_string += "</ul>";
            
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