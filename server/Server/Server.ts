import express, {Request, Response, Express} from "express";
import path from 'path';
import bodyParser from 'body-parser';
import { PageCreator } from "./PageCreator";
import { Persistence } from "../Persistence/Persistence"

class Server {
    private app: Express;
    private listener: any;
    private db: Persistence;
    private page: PageCreator;
    
    public constructor(db: Persistence, page: PageCreator) {
        this.db = db
        this.page = page

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
        
        this.app.get("/", this.page.mainPage);
        this.app.get("/confirm", this.confirm.bind(this));
        this.app.get("/buyer", this.buyer.bind(this));
        this.app.get("/seller", this.seller.bind(this));
        this.app.get("/detail", this.detail.bind(this));
        this.app.get("/land", this.land.bind(this));
    }

    private confirm(req: Request, res: Response) {
        this.page.confirmPage(req, res, this.db)
    }

    private buyer(req: Request, res: Response) {
        this.page.paymentByBuyerPage(req, res, this.db)
    }
    
    private seller(req: Request, res: Response) {
        this.page.paymentBySellerPage(req, res, this.db)
    }

    private detail(req: Request, res: Response) {
        this.page.detailPage(req, res, this.db)
    }

    private land(req: Request, res: Response) {
        this.page.landPage(req, res, this.db)
    }
    
    public listen() {
        this.listener = this.app.listen(process.env.PORT, () => {
            console.log(`[server]: Server is running at https://localhost:${process.env.PORT}`);
        });
    }  
}

export { Server }