import qr from "qrcode";
import { Persistence } from "../Persistence/Persistence"
import { paymentEntry } from "../Persistence/Types/paymentEntry";
import { payment } from "../Persistence/Types/payment";
import { Request, Response } from "express"
import * as CONTRACT from "../public/contract/contract.json";

class PageCreator {

    private static formatPrice(price: Number) {
        return price.toFixed(2)
    }

    public landPage(req: Request, res: Response, db: Persistence): void {
        let id: bigint
        try {
            id = BigInt(req.query.id as string)
        } catch {
            res.redirect('/')
            return;
        }
        db.getPaymentEntryByID(id)
        .then((item: paymentEntry) => {
            res.render("land", {
                serverURL: process.env.SERVER_URL + req.originalUrl,
                seller: item.seller,
                price: PageCreator.formatPrice(Number(item.price) / 100),
                id: req.query.id
            });
        })
        .catch(() => {
            res.redirect('/')
        })
    }
    
    public helpPage(req: Request, res: Response): void {
        res.render("help", {serverURL: process.env.SERVER_URL + req.originalUrl});   
    }
    
    public mainPage(req: Request, res: Response): void {
        res.render("main", {serverURL: process.env.SERVER_URL + req.originalUrl});
    }
    
    public confirmPage(req: Request, res: Response, db: Persistence): void {
        let id: bigint
        try {
            id = BigInt(req.query.id as string)
        } catch {
            res.redirect('/')
            return;
        }
        db.getPaymentByID(id)
        .then((item: payment) => {
            let confirmed = ""
            if (item.confirmed != null) {
                confirmed = "<span class=\"date\">Closed "+this.timeConverter(item.confirmed)+"</span>"
            }      
            res.render("confirm", {
                price: PageCreator.formatPrice(Number(item.price) / 100),
                buyer: item.buyer,
                seller: item.seller,
                created: this.timeConverter(item.created),
                confirmed: confirmed,
                status:  this.statusConverter(item.status),
                serverURL: process.env.SERVER_URL + req.originalUrl,
                id: req.query.id
            });
        })    
        .catch(() => {
            res.redirect('/')
        })
    }
    
    public paymentByBuyerPage(req: Request, res: Response, db: Persistence): void {    
        db.getPaymentByBuyer(req.query.id as string || "")
        .then((items: payment[]) => {
            let item_string: string = "<ul class=\"transactions\">"
            for (let i = 0; i < items.length; i++) {
                item_string +=
                "<a href=\"detail?id="+items[i].id+"\">" +
                "<li class=\"stato"+items[i].status+"\">"+
                "<strong class=\"price\">" + PageCreator.formatPrice(Number(items[i].price) / 100) + "$</strong>" +
                "<span class=\"nascosto\">" + this.statusConverter(items[i].status) + "</span>"+
                "<span class=\"date\">" + this.timeConverter(items[i].created) + "</span>" +
                "</li>" +
                "</a>"
            }
            item_string += "</ul>";
            
            if (items.length == 0) {
                item_string = "<div class=\"info\" id=\"none-found\">No transaction found</div>"
            }
            res.render("buyer", {
                items: item_string,
                id: req.query.id,
                serverURL: process.env.SERVER_URL + req.originalUrl,
            });
        })
        .catch(() => {
            res.redirect('/')
        })
    }
    
    public detailPage(req: Request, res: Response, db: Persistence): void {
        let id: bigint
        try {
            id = BigInt(req.query.id as string)
        } catch {
            res.redirect('/')
            return;
        }
        db.getPaymentByID(id)
        .then((item: payment) => {
            const qr_url = "https://metamask.app.link/dapp/" +  process.env.SERVER_URL + "/confirm?id=" + req.query.id;
            qr.toDataURL(qr_url)
            .then((img_data) => {
                const qr_str = "<a id=\"qr\" download=\"qr_"+item.id+".png\" href=\""+img_data+"\">Download QR</a>"
                let conf = "Expire " + this.timeConverter(BigInt(item.created) + BigInt(CONTRACT.TIMEOUT));
                if (item.status == 2) {
                    conf = "Confirmed " + this.timeConverter(item.confirmed as bigint);
                } else if (item.status == 3) {
                    conf = "Expired " + this.timeConverter(item.confirmed as bigint);
                } else if (item.status == 0) {
                    conf = "Cancelled " + this.timeConverter(item.confirmed as bigint);
                }
                res.render("detail", {
                    serverURL: process.env.SERVER_URL + req.originalUrl,
                    price: PageCreator.formatPrice(Number(item.price) / 100),
                    buyer: item.buyer,
                    seller: item.seller,
                    created: this.timeConverter(item.created),
                    confirmed: conf,
                    status:  this.statusConverter(item.status),
                    qr: qr_str,
                    id: req.query.id,
                    timestamp: item.created
                });
            })
        })
        .catch(() => {
            res.redirect('/')
        })
    }
    
    public paymentBySellerPage(req: Request, res: Response, db: Persistence): void {
        db.getPaymentBySeller(req.query.id as string || "")
        .then((items: payment[]) => {
            let item_string: string = "<ul class=\"transactions\">"
            for (let i = 0; i < items.length; i++) {
                item_string +=
                "<a href=\"detail?id="+items[i].id+"\">" +
                "<li class=\"stato"+items[i].status+"\">"+
                "<strong class=\"price\">" + PageCreator.formatPrice(Number(items[i].price) / 100) + "$</strong>" +
                "<span class=\"nascosto\">" + this.statusConverter(items[i].status) + "</span>"+
                "<span class=\"date\">" + this.timeConverter(items[i].created) + "</span>" +
                "</li>" +
                "</a>"
            }
            item_string += "</ul>";
            
            if (items.length == 0) {
                item_string = "<div class=\"info\" id=\"none-found\">No transaction found</div>"
            }
            res.render("seller", {
                items: item_string,
                id: req.query.id,
                serverURL: process.env.SERVER_URL + req.originalUrl,
            });       
        })
        .catch(() => {
            res.redirect('/')
        })
    }
    
    private statusConverter(status: number): string {
        if (status == 0) {
            return "Cancelled"
        }
        if (status == 2) {
            return "Confirmed"
        }
        if (status == 3) {
            return "Expired"
        } 
        return "Open"    
    }
    
    private timeConverter(timestamp: bigint): string {
        var a = new Date(Number(timestamp)*1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = String(a.getMinutes()).padStart(2,'0');
        var sec = String(a.getSeconds()).padStart(2,'0');
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
        return time;
    }
}

export { PageCreator }