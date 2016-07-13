/**
 * Created by ASUS on 2016/7/5.
 */


function route(handle, pathname, request, response, postData) {
    if (typeof handle[pathname] == "function") {
        handle[pathname](request, response, postData);
        console.log("route was called!");
    }
    else {
        response.writeHead(404, {"Content-type": "text/plain"});
        response.write("request error!");
        response.end();
    }
}

exports.route = route;