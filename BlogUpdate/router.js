/**
 * Created by lihaiyan on 16/7/15.
 */
function route(handle,pathname,request,response,postData) {
    if(typeof handle[pathname]=="function"){
        handle[pathname](request,response,postData);
        console.log("route was called");
    }
    else{
        response.writeHead(200,{"Content-Type":"text/plain"});
        response.write("request failed");
        response.end();
    }
}

exports.route=route;
