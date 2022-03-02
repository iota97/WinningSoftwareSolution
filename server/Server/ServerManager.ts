import { Persistence } from "../Persistence/Persistence";
import { Server } from './Server';
import { PageCreator } from "./PageCreator";
import assert from 'assert';
import { ShopContract_Interface } from '../Persistence/ShopContract_Interface';
import { SQL_Interface } from '../Persistence/SQL_Interface';

export class ServerManager {
    private shopContract: ShopContract_Interface | null = null;
    private sql: SQL_Interface | null = null;
    private page: PageCreator | null = null;
    private server: Server | null = null;
    
    public setContract(shopContract: ShopContract_Interface): ServerManager {
        this.shopContract = shopContract;
        return this
    }
    public setSQL(sql: SQL_Interface): ServerManager {
        this.sql = sql;
        return this
    }
    public setPageCreator(page: PageCreator): ServerManager {
        this.page = page;
        return this
    }

    public start(): ServerManager {
        assert(this.page != null)
        assert(this.sql != null)
        assert(this.shopContract != null)

        this.server = new Server(
            new Persistence(this.sql, this.shopContract),
            this.page
        )
        return this
    }

    public closeServer(): void {
        this.server?.close()
    }
}