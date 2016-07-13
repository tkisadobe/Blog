/**
 * Created by ASUS on 2016/7/5.
 */
var http = require("http");
var url = require("url");
var querystring = require("querystring");

function start(route, handle) {

    function onResponse(request, response) {
        var pathname = url.parse(request.url).pathname;
        console.log(pathname);
        var postData = "";
        request.setEncoding("utf8");
        request.addListener("data", function (postDataChunk) {
            postData = decodeURIComponent(postDataChunk);
        });
        request.addListener("end", function () {
            console.log(postData);
            var data = querystring.parse(postData);
            route(handle, pathname, request, response, data);
        });
    }

    http.createServer(onResponse).listen(8888);
}

exports.start = start;