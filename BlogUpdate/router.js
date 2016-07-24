/**
 * Created by lihaiyan on 16/7/15.
 */
var path = require('path');
var fs = require('fs');
function route(handle, pathname, request, response, postData) {
    if (typeof handle[pathname] == "function") {
        handle[pathname](request, response, postData);
        console.log("route was called");
    }
    else {
        var filePath = '.' + request.url;
        var extname = path.extname(filePath);
        if (
            (extname === '.js') || (extname === '.css')
            || (extname === '.map')
        ) {
            contentType = 'text/html';
            if (extname === '.js')
                contentType = 'text/javascript';
            else if (extname === '.css')
                contentType = 'text/css';
            fs.readFile(filePath, function (error, content) {
                console.log('error', error);
                if (error) {
                    console.log('real error', error);
                    if (error.code == 'ENOENT') {
                        fs.readFile('./404.html', function (error, content) {
                            response.writeHead(200, {'Content-Type': contentType});
                            response.end(content, 'utf-8');
                        });
                    }
                    else {
                        response.writeHead(500);
                        response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
                        response.end();
                    }
                }
                else {
                    // console.log('content', content);
                    // console.log('contentType', contentType);
                    response.writeHead(200, {'Content-Type': contentType});
                    response.end(content, 'utf-8');
                    // response.end(content, 'binary');
                    //response.end();
                }
            });
        }
        else {
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write("request failed");
            response.end();
        }
    }
}

exports.route = route;
