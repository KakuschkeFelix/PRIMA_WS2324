import { FudgeServer } from "../FudgeNet/Server/FudgeServer.js";
import { argv } from "process";

let args = argv;
let port = 4000;

for (let i = 0; i < args.length; i++) {
      if (args[i] === '--port' || args[i] === '-p') {
            if (i + 1 < args.length && !isNaN(Number(args[i + 1]))) {
                  port = Number(args[i + 1]);
                  break;
            }
      }
}

let server: FudgeServer = new FudgeServer();
server.startUp(port);