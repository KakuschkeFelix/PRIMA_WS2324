"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FudgeServer_js_1 = require("../FudgeNet/Server/FudgeServer.js");
var port = 4000;
var server = new FudgeServer_js_1.FudgeServer();
server.startUp(port);
