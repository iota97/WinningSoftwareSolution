import { SQL } from "./Persistence/SQL";
import { PageCreator } from "./Server/PageCreator";
import { ServerManager } from "./Server/ServerManager"

new ServerManager()
.setSQL(new SQL)
.setPageCreator(new PageCreator)
.setWebSocketProvider('wss://speedy-nodes-nyc.moralis.io/' + process.env.API_KEY  + '/polygon/mumbai/ws')
.start();