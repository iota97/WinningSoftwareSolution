import qr from "qrcode";
import { Persistence } from "../Persistence/Persistence"
import { paymentEntry } from "../Persistence/Types/paymentEntry";
import { payment } from "../Persistence/Types/payment";

class PageCreator {
    public landPage(req: any, res: any, db: Persistence) {
        db.getPaymentEntryByID(req.query.id)
        .then((item: paymentEntry) => {
            res.render("land", {
                serverURL: process.env.SERVER_URL + "/land?id=" + req.query.id,
                seller: item.seller,
                price: item.price / BigInt(100),
                id: req.query.id
            });
        })
        .catch(() => {
            res.redirect('/')
        })
    }
    
    public helpPage(req: any, res: any) {
        res.render("help", {serverURL: process.env.SERVER_URL + "/help"});   
    }
    
    public mainPage(req: any, res: any) {
        res.render("main", {serverURL: process.env.SERVER_URL});
    }
    
    public confirmPage(req: any, res: any, db: Persistence) {
        db.getPaymentByID(req.query.id)
        .then((item: payment) => {
            res.render("confirm", {
                price: item.price / BigInt(100),
                buyer: item.buyer,
                seller: item.seller,
                created: this.timeConverter(item.created),
                confirmed: this.timeConverter(item.confirmed),
                status:  this.statusConverter(item.status),
                serverURL: process.env.SERVER_URL + "/confirm?id=" + req.query.id,
                id: req.query.id
            });
        })    
        .catch(() => {
            res.redirect('/')
        })
    }
    
    public paymentByBuyerPage(req: any, res: any, db: Persistence) {
        db.getPaymentByBuyer(req.query.id || "")
        .then((items: payment[]) => {
            let item_string: string = "<ul class=\"transactions\">"
            for (let i = 0; i < items.length; i++) {
                item_string +=
                "<a href=\"detail?id="+items[i].id+"\">" +
                "<li class=\"stato"+items[i].status+"\">"+
                "<strong class=\"price\">" + items[i].price / BigInt(100) + "$</strong>" +
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
                serverURL: process.env.SERVER_URL + "/buyer?id=" + req.query.id,
            });
        })
        .catch(() => {
            res.redirect('/')
        })
    }
    
    public detailPage(req: any, res: any, db: Persistence) {
        db.getPaymentByID(req.query.id)
        .then((item: payment) => {
            const qr_url = "https://metamask.app.link/dapp/" +  process.env.SERVER_URL + "/confirm?id=" + req.query.id;
            qr.toDataURL(qr_url)
            .then((img_data) => {
                const qr_str = "<a id=\"qr\" download=\"qr_"+item.id+".png\" href=\""+img_data+"\">Download QR</a>"
                let conf: string = "Confirmed " + this.timeConverter(item.confirmed);
                if (item.status == 1) {
                    conf = "Expire on: " + this.timeConverter(String(BigInt(item.created) + BigInt(60*60*24*14)));
                } else if (item.status == 3) {
                    conf = "Expired on: " + this.timeConverter(item.confirmed);
                }
                res.render("detail", {
                    serverURL: process.env.SERVER_URL + "/detail?id=" + req.query.id,
                    price: item.price / BigInt(100),
                    buyer: item.buyer,
                    seller: item.seller,
                    created: this.timeConverter(item.created),
                    confirmed: conf,
                    status:  this.statusConverter(item.status),
                    qr: qr_str
                });
            })
        })
        .catch(() => {
            res.redirect('/')
        })
    }
    
    public paymentBySellerPage(req: any, res: any, db: Persistence) {
        db.getPaymentBySeller(req.query.id || "")
        .then((items: payment[]) => {
            let item_string: string = "<ul class=\"transactions\">"
            for (let i = 0; i < items.length; i++) {
                item_string +=
                "<a href=\"detail?id="+items[i].id+"\">" +
                "<li class=\"stato"+items[i].status+"\">"+
                "<strong class=\"price\">" + items[i].price / BigInt(100) + "$</strong>" +
                "<span class=\"date\">" + this.timeConverter(items[i].created) + "</span>" +
                "</li>" +
                "</a>"
            }
            item_string += "</ul>";
            
            if (items.length == 0) {
                item_string = "<div>Nessuna transazione trovata</div>"
            }
            res.render("seller", {
                items: item_string,
                id: req.query.id,
                serverURL: process.env.SERVER_URL + "/seller?id=" + req.query.id,
            });       
        })
        .catch(() => {
            res.redirect('/')
        })
    }
    
    private statusConverter(status: number) {
        if (status == 2) {
            return "Closed"
        }
        if (status == 3) {
            return "Expired"
        } 
        return "Open"    
    }
    
    private timeConverter(timestamp: string){
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