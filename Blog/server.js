/**
 * Created by lihaiyan on 16/7/9.
 */

var http = require("http");
var url = require("url");

function start(route, handle) {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;
        // console.log('method is ' + request.method);
        console.log("Request for " + pathname + " received.");
        route(handle, pathname, response, request);
    }

    http.createServer(onRequest).listen(8080);
    console.log("Server has started.");
}

exports.start = start;
