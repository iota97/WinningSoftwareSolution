import * as dotenv from "dotenv";

import { Persistence } from "./Persistence/Persistence";
import {createWebServer} from './routes/index';

dotenv.config();

Persistence.get().getPaymentByBuyer("0x6FA95dc7d52719cC61B9966CbFFa6d7E70B3F4c1")
.then((res: any) => {
    console.log(res)
})

createWebServer();