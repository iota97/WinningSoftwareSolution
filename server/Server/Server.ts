import express, { Request, Response, Express } from "express";
import http from "http"
import path from 'path';
import bodyParser from 'body-parser';
import { PageCreator } from "./PageCreator";
import { Persistence } from "../Persistence/Persistence"

class Server {
    private app: Express;
    private listener: http.Server;
    private db: Persistence;
    private page: PageCreator;
    
    public constructor(db: Persistence, page: PageCreator) {
        this.db = db
        this.page = page

        this.app = express();
        
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.set("view engine", "ejs");
        
        this.initRoutes();

        this.listener = this.app.listen(process.env.PORT, this.successCallback);
    }
    
    public close(): void {
        this.listener.close();
    }

    private successCallback(): void {
        console.log(`[server]: Server is running at https://localhost:${process.env.PORT}`);
    }

    private initRoutes(): void {
        this.app.use(express.static(path.join(__dirname, "../public")));
        
        this.app.get("/", this.page.mainPage);
        this.app.get("/help", this.page.helpPage);
        this.app.get("/confirm", this.confirm.bind(this));
        this.app.get("/buyer", this.buyer.bind(this));
        this.app.get("/seller", this.seller.bind(this));
        this.app.get("/buyer_detail", this.buyerDetail.bind(this));
        this.app.get("/seller_detail", this.sellerDetail.bind(this));
        this.app.get("/land", this.land.bind(this));

        // Last route, none matched
        this.app.get('*', this.page.mainPage);
    }

    private confirm(req: Request, res: Response): void {
        this.page.confirmPage(req, res, this.db)
    }

    private buyer(req: Request, res: Response): void {
        this.page.paymentByBuyerPage(req, res, this.db)
    }
    
    private seller(req: Request, res: Response): void {
        this.page.paymentBySellerPage(req, res, this.db)
    }

    private buyerDetail(req: Request, res: Response): void {
        this.page.detailPage(req, res, this.db, "buyer")
    }

    private sellerDetail(req: Request, res: Response): void {
        this.page.detailPage(req, res, this.db, "seller")
    }

    private land(req: Request, res: Response): void {
        this.page.landPage(req, res, this.db)
    }
}

export { Server }