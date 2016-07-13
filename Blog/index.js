/**
 * Created by lihaiyan on 16/7/8.
 */

var server = require("./server");
var router = require("./router");
var handler = require("./handler");

var handle = {}
handle["/"] = handler.start;
handle["/start"] = handler.start;
handle["/login"]=handler.login;
handle["/register"]=handler.register;
handle["/load"]=handler.load;
handle["/loginjudge"]=handler.loginjudge;
handle["/upload"] = handler.upload;
handle["/show"] = handler.show;

server.start(router.route, handle);