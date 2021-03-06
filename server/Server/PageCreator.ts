import qr from "qrcode";
import { Persistence } from "../Persistence/Persistence"
import { paymentEntry } from "../Persistence/Types/paymentEntry";
import { payment } from "../Persistence/Types/payment";
import { Request, Response } from "express"
import * as CONTRACT from "../public/contract/contract.json";

class PageCreator {

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
                price: PageCreator.priceConverter(item.price),
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
                confirmed = "<span class=\"date\">Closed "+PageCreator.timeConverter(item.confirmed)+"</span>"
            }
            res.render("confirm", {
                price: PageCreator.priceConverter(item.price),
                buyer: item.buyer,
                seller: item.seller,
                created: PageCreator.timeConverter(item.created),
                confirmed: confirmed,
                status:  PageCreator.statusConverter(item.status),
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
            let item_string: string = "<div class=\"data_type\"> <span> Price </span> <span> Date </span> <span> State </span> </div>" +
            "<ul class=\"transactions\">"
            for (let i = 0; i < items.length; i++) {
                item_string +=
                "<a href=\"buyer_detail?id="+items[i].id+"\">" +
                "<li class=\"stato"+items[i].status+"\">"+
                "<strong class=\"price_list\">" + PageCreator.priceConverter(items[i].price) + "$</strong>" +
                "<span class=\"date_list\">" + PageCreator.timeConverter(items[i].created) + "</span>" +
                "<span class=\"state_list\">" + PageCreator.statusConverter(items[i].status) + "</span>" +
                "</li>" + "</a>"
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

    public detailPage(req: Request, res: Response, db: Persistence, type: String): void {
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
                let conf = "Expire " + PageCreator.timeConverter(BigInt(item.created) + BigInt(CONTRACT.TIMEOUT));
                if (item.status == 2) {
                    conf = "Confirmed " + PageCreator.timeConverter(item.confirmed as bigint);
                } else if (item.status == 3) {
                    conf = "Expired " + PageCreator.timeConverter(item.confirmed as bigint);
                } else if (item.status == 0) {
                    conf = "Cancelled " + PageCreator.timeConverter(item.confirmed as bigint);
                }
                res.render("detail", {
                    serverURL: process.env.SERVER_URL + req.originalUrl,
                    price: PageCreator.priceConverter(item.price),
                    buyer: item.buyer,
                    seller: item.seller,
                    created: PageCreator.timeConverter(item.created),
                    confirmed: conf,
                    status:  PageCreator.statusConverter(item.status),
                    qr: qr_str,
                    id: req.query.id,
                    timestamp: item.created,
                    bread: type == "seller" ? "<a id=\"bread-seller\" href=\"seller\">Incoming Transactions</a>" : "<a id=\"bread-buyer\" href=\"buyer\">Outgoing Transactions</a>"
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
            let item_string: string = "<div class=\"data_type\"> <span> Price </span> <span> Date </span> <span> State </span> </div>" +
            "<ul class=\"transactions\">"
            for (let i = 0; i < items.length; i++) {
                item_string +=
                "<a href=\"seller_detail?id="+items[i].id+"\">" +
                "<li class=\"stato"+items[i].status+"\">"+
                "<strong class=\"price_list\">" + PageCreator.priceConverter(items[i].price) + "$</strong>" +
                "<span class=\"date_list\">" + PageCreator.timeConverter(items[i].created) + "</span>" +
                "<span class=\"state_list\">" + PageCreator.statusConverter(items[i].status) + "</span>"
                + "</li>" + "</a>"
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

    private static statusConverter(status: number): string {
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

    private static timeConverter(timestamp: bigint): string {
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

    private static priceConverter(price: bigint): string {
        return (Number(price) / 100).toFixed(2);
    }
}

export { PageCreator }
