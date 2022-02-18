import * as dotenv from "dotenv";
import { Server } from './Server/Server';

dotenv.config();

Server.get().listen();