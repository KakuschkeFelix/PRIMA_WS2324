"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FudgeServer_js_1 = require("../Runtime/Net/Server/FudgeServer.js");
var process_1 = require("process");
var args = process_1.argv;
var port = 4000;
for (var i = 0; i < args.length; i++) {
    if (args[i] === '--port' || args[i] === '-p') {
        if (i + 1 < args.length && !isNaN(Number(args[i + 1]))) {
            port = Number(args[i + 1]);
            break;
        }
    }
}
var server = new FudgeServer_js_1.FudgeServer();
server.startUp(port);
