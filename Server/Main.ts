import { FudgeServer } from "../FudgeNet/Server/FudgeServer.js";


const port = 4000;

let server: FudgeServer = new FudgeServer();
server.startUp(port);