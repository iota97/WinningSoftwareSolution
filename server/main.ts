import * as dotenv from "dotenv";
import Web3 from 'web3';
import { ShopContract } from "./Persistence/ShopContract";
import { SQL } from "./Persistence/SQL";
import { Persistence } from "./Persistence/Persistence";
import { PageCreator } from "./Server/PageCreator";
import { Server } from "./Server/Server"
dotenv.config();

const provider = new Web3.providers.WebsocketProvider('wss://speedy-nodes-nyc.moralis.io/' + process.env.API_KEY  + '/polygon/mumbai/ws')
const web3 = new Web3(provider)

new Server(
    new Persistence(new SQL, new ShopContract(web3)),
    new PageCreator
)