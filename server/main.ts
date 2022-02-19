import * as dotenv from "dotenv";
dotenv.config();

import { Persistence } from "./Persistence/Persistence";
import { SQL, SQL_Interface } from "./Persistence/SQL";
import { ShopContractEventManager } from "./Persistence/ShopContractEventManager"
import { ShopContract } from "./Persistence/ShopContract"

import { Server } from './Server/Server';
import Web3 from 'web3';

const provider = new Web3.providers.WebsocketProvider('wss://speedy-nodes-nyc.moralis.io/' + process.env.API_KEY  + '/polygon/mumbai/ws')
const web3 = new Web3(provider);
const shopContract =  new ShopContract(web3);
const sql: SQL_Interface = new SQL();
const persistance: Persistence = new Persistence(sql);

new ShopContractEventManager(sql, shopContract);

new Server(persistance).listen();