import Web3 from 'web3';
import { WebsocketProvider } from "web3-providers-ws"
import { Persistence } from "../Persistence/Persistence";
import { ShopContractEventManager } from "../Persistence/ShopContractEventManager"
import { ShopContract } from "../Persistence/ShopContract"
import { SQL } from '../Persistence/SQL';
import { Server } from './Server';
import { PageCreator } from "./PageCreator";
import assert from 'assert';
import * as dotenv from "dotenv";
import { ShopContract_Interface } from '../Persistence/ShopContract_Interface';
import { SQL_Interface } from '../Persistence/SQL_Interface';

export class ServerManager {
    private shopContract: ShopContract_Interface | null = null;
    private sql: SQL_Interface | null = null;
    private page: PageCreator | null = null;
    private server: Server | null = null;

    public constructor() {
        dotenv.config();
    }
    
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
            new Persistence(this.sql),
            this.page
        )
        new ShopContractEventManager(
            this.sql,
            this.shopContract
        )
        return this
    }

    public closeServer(): void {
        this.server?.close()
    }
}