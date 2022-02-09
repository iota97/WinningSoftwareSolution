import * as dotenv from "dotenv";

import {initDB} from "./DB/initDB";
import {createWebServer} from './routes/index';

dotenv.config();

initDB();
createWebServer();