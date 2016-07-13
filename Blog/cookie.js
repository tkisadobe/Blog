/**
 * Created by lihaiyan on 16/7/13.
 */
var http=require('http');
http.createServer(function (request,response) {

    //获得客户端的cookies
    var Cookies = {};

    request.headers.cookie && request.headers.cookie.split(';').forEach(function (Cookie) {
        console.log(request.headers.cookie);
        console.log("*****");
        var parts = Cookie.split('=');
        console.log(parts);
        console.log("*****");
        Cookie[parts[0].trim()] = (parts[1] || '').trim();
    });
    console.log(Cookies);
    //向客户端设置一个cookie

    response.writeHead(200, {
        'Set-Cookie': ['aaa=111', 'bbb=222', 'ccc=333'],
        'Content-Type': 'text/html'
    })
    response.end('Hello World\n<script>console.log("lalala")</script>');
}).listen(8000);

function addCookie(name,val,opt) {
    if(!this.resCookies){
        this.resCookies={};
        this.resCookies[name]=[val,opt];
        this.bind("header",function () {
            var array=[];
            for(var i=0;i<this.resCookies.length;i++){
                var arr=this.resCookies[i];
                array.push(Cookie.stringify(i,arr[0],arr[1]));
            }
            this.setHeader.call(thseis.response,"Set-Cookie",array)
        })
    }
    else{
        this.resCookies[name]=[val,opt];
    }
    return this;
}
function removeCookie(name) {
    var cookies = Array.isArray(name) ? name : [ name ];

    cookies.forEach(function(cookie){

        this.addCookie(cookie,"", 0)

    },this);

    
    return this;
}
    
