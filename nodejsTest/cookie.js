
var http = require('http');

http.createServer(function (req, res) {

    // 获得客户端的Cookie

    var Cookies = {};

    req.headers.cookie && req.headers.cookie.split(';').forEach(function( Cookie ) {
        console.log(req.headers.cookie);
        console.log("####");
        var parts = Cookie.split('=');
        console.log(parts);
        console.log("####");
        Cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
    });

    console.log(Cookies);

    // 向客户端设置一个Cookie

    res.writeHead(200, {

        //'Set-Cookie': 'SSID=Ap4GTEq; Expires=Wed, 13-Jan-2021 22:23:01 GMT;HttpOnly ',
        'Set-Cookie': ['aaa=111','bbb=222','ccc=333'],
        'Content-Type': 'text/html'

    });

    //res.end('Hello World\n<script>console.log(document.Cookie)</script>');
    res.end('Hello World\n<script>console.log("lalala")</script>');

}).listen(8000);

function addCookie(name, val, opt){

    if(!this.resCookies){

        this.resCookies = {};

        this.resCookies[name] = [val, opt]

        this.bind("header", function(){

            var array = []

            for(var i = 0 ; i <this.resCookies.length;i++){

                var arr = this.resCookies[i];

                array.push( Cookie.stringify(i, arr[0], arr[1] ) )

            }

            this._setHeader.call(thseis.res, "Set-Cookie",array)

        })

    }else{

        this.resCookies[name] = [val, opt]

    }

    return this;

};

function removeCookie(name){

    var cookies = Array.isArray(name) ? name : [ name ];

    cookies.forEach(function(cookie){

        this.addCookie(cookie,"", 0)

    },this);

    return this;

};
