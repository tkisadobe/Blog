/**
 * Created by ASUS on 2016/7/5.
 */
var mongoClient = require('mongodb').MongoClient;
var querystring = require('querystring');
var url = require("url");
var md5 = require("md5");
var ObjectID = require("mongodb").ObjectID;

var URL = "mongodb://localhost:27017/blogger";
function homePage(request,response ,titleList ,postData){
        var body = '<html>' +
        '<head>' +
        '<meta http-equiv="Content-Type" content="text/html; '+
        'charset=UTF-8" />' +
        '</head>' +
        '<body>' +
        '<a href="/register">'+"sign up"+'</a>'+
        '<li/>'+
        '<a href="/login">'+"login"+'</a>'+
            //博客title列表
        '<ul>' + '<li value="hot blogger">'+'</li>'+ titleList + '</ul>' +
        '<a href="/newBlogger">'+"write a new blogger"+ '</a>'+
        '</body>' +
        '</html>';
    response.writeHead(200, {"Content-type": "text/html" ,});
    response.write(body);
    response.end();


}

//添加博客界面
function newBlogger(request, response,postData) {
    var body = '<html>' +
        '<head>' +
        '<meta http-equiv="Content-Type" content="text/html; ' +
        'charset=UTF-8" />' +
        '</head>' +
        '<body>' +
        '<form action="/insertArticle" method="post">' +
        '<input type="text" name="title"/>' +
        '<textarea name="body"></textarea>' +
        '<input type="submit" value="send">' +
        '</form>' +
        '</body>' +
        '</html>';
    response.writeHead(200, {"Content-type": "text/html"});
    response.write(body);
    response.end();
    console.log("newBlogger success");
}
//登陆界面
function login(requset,response,postData){
    console.log("login");
    var body = '<html>'+
        '<head>'+
        '<meta http-equiv="CONTENT-TYPE" content="text/html" charset="utf-8"/>'+
        '</head>'+
        '<body>'+
        '<form action="/loginResult" method="post">'+
        '<input type="text" value="name" name="username" id="username">'+'</input>'+
        '<input type="text" value="password" name="password" id="password">'+'</input>'+
        '<input type="submit" onsubmit="encrypt()" value="login">'+'</input>'+
        '</form>'+
        '</body>'+
        '</html>';
    response.writeHead(200,{"Content-type":"text/html"});
    response.write(body);
    response.end();
}
function loginResult(requset,response,postData){
    mongoClient.connect(URL,function(e,db){
        if(e){
            console.log(e);
        }else{
            var owner = db.collection("owner");
            var result = checkPassword(owner,postData.username,postData.password,function(result){
                if(result){
                    insertSessions(owner,postData);
                    response.writeHead(200,{"Content-type":"text/html","Set-Cookie":"message"+md5(postData)});
                    response.write("loginResult success"+'<a href="/load">' +"homepage"+ '<a/>');
                    response.end();
                }else{
                    response.writeHead(200,{"Content-type":"text/html"});
                    response.write("loginResult fail");
                    response.end();
                }
            });
        }
    });

}

//注册界面
function register(requset,response){
    var body = '<html>'+
        '<head>'+
        '<meta http-equiv="CONTENT-TYPE" content="text/html" charset="utf-8"/>'+
        '</head>'+
        '<body>'+
        '<form action="/insertUser">'+
        '<input type="text" value="name" name="username">'+ '</input>'+
        '<input type="text" value="password" name="password">'+'</input>'+
        '<input type="text" value="age" name="age">'+ '</input>'+
        '<input type="submit" value="save">'+'</input>'+
        '</form>'+
        '</body>'+
        '</html>'
    response.writeHead(200,{"Content-type":"text/html"});
    response.write(body);
    response.end();
}

//博客详情界面
function showBlogger(response,result){
    var id = '<a href=/remove?' + result._id + '>' + "delete" + '</a>';
    var body = '<html>' +
        '<head>' +
        '<meta http-equiv="Content-Type" content="text/html; ' +
        'charset=UTF-8" />' +
        '</head>' +
        '<body>' +
        '<article>' +
        '<h1>' + "" + result.title + '</h1>' +
        '<p>' + "" + result.body + '</p>' +
        '<p>' + result.date + '</p>' +
        '</article>' +
        id +
        '</body>' +
        '</html>'
    response.writeHead(200, {"Content-type": "text/html"});
    response.write(body);
    response.end();
}

//首页的加载
function load(request,response,postData){
    mongoClient.connect(URL,function(e,db){
        if(e){
            console.log(e);
        }
        else{
            var article = db.collection('article');
            var owner = db.collection("owner");
            var titleList = "";
            //sign选择response返回 
            var sign = 0;
            article.find({},{title:1}).toArray(function(e,items){
                if (e){
                    console.log(e);
                }
                else {
                    for (var i = 0; i < items.length; i++) {
                        titleList +=
                            '<a href=/findBlogger?_id='+items[i]._id+'> '+'<li>'+items[i].title+'</li>'+ '</a>';
                    }
                    //传递给界面显示
                    homePage(request,response,titleList,postData,sign);
                }
            });
        }
    });
}

// 查找博客
function findBlogger(request, response) {
    mongoClient.connect(URL, function (e, db) {
        if (e) {
            console.log(e);
        }
        else {
            var collection = db.collection("article");
            var reqData = querystring.parse(url.parse(request.url).query);
            console.log(reqData);
            var objectId = new ObjectID(reqData._id);
            collection.findOne({_id : objectId}, function (e, result) {
                if(e){
                    console.log(e)
                }else{
                    console.log(result);
                    showBlogger(response,result);
                    db.close();
                }
            });
        }
    });
}

function insertArticle(request, response, postData) {
    mongoClient.connect(URL, function (e, db) {
        if(e){
            console.log(e);
        }else{
            var article = db.collection("article");
            var owner = db.collection("owner");
            var Cookies = {};
            console.log(request.headers.cookie);
            request.headers.cookie && request.headers.cookie.split(';').forEach(function( Cookie ) {
                var parts = Cookie.split('=');
                Cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
            });
            owner.findOne({sessions:Cookies.message},{name : 1},function(e,result){
                console.log(result);
                var data = {title: postData.title, body: postData.body, date: new Date(),owner:result.name};
                article.insert(data, function (e, result) {
                    if (e) {
                        console.log(e);
                    }
                    else {
                        console.log(result);
                        response.writeHead(200, {"Content-type": "text/plain"});
                        response.write("send success");
                        response.end();
                        db.close();
                    }
                });
            });

        }
    });
}

function remove(request, response) {
    var reqStr = url.parse(request.url).query;
    var mongodb = require("mongodb");
    var objectId = mongodb.ObjectID(reqStr);
    mongoClient.connect(URL, function (e, db) {
        if (e) {
            console.log(e);
        }
        else {
            var collection = db.collection("blogger");
            collection.remove({_id: objectId}, function (e, result) {
                response.writeHead(200, {"Content-type": "text/plain"});
                console.log(e);
                console.log(result);
                if (e) {
                    response.write("delete error");
                }
                else {
                    response.write("delete success");
                }
                response.end();
            });

        }
    });
    console.log("remove");
}

function insertUser(request , response ,postData){
    var reqStr = url.parse(request.url).query;
    var reqData = querystring.parse(reqStr);
    var data = {name : reqData.username , password : reqData.password , age : reqData.age};
    mongoClient.connect(URL , function(e, db){
        if(e){
            console.log(e);
        }else{
            var collection = db.collection("owner");

            collection.findOne({name : reqData.username},function(e,result){
                if(result == null ){
                    collection.insert(data,function(e,result){
                        if(e){
                            console.log(e);
                        }else{
                            console.log("owner insert success");
                            response.writeHead(200,{"Content-type":"text/html"});
                            response.write("register success");
                            response.end();
                        }
                    });
                }else{
                    response.writeHead(200,{"Content-type":"text/html"});
                    response.write("用户名已经存在，请另换用户名");
                    response.end();
                }
            });


        }
    });
}

function checkPassword(collection,name,password,cb){
    console.log("password-->"+password);
    collection.findOne({name : name},{password:1},function(e,result){
       if(e){
           console.log(e);
           return cb(false);
       }else{
           console.log(result);
           if(result.password == password){
               console.log("###");
               return cb(true);
           }else{
               return cb(false);
           }
       }
    });
}

function insertSessions(collection,postData){
    var md5M = (postData);
    collection.insert({name:postData.username},{sessions:[{md5Message:md5M},{md5Time:new Date()}]},
        function(e,result){
            if(e){
                return false;
                console.log(e);
            }else{
                if(result.n == 1){
                    return true;
                    console.log("insertSessions success");
                }else{
                    return false;
                }
            }
        })
}

exports.load = load;
exports.insertArticle = insertArticle;
exports.findBlogger = findBlogger;
exports.remove = remove;
exports.insertUser = insertUser;
exports.register = register;
exports.login = login;
exports.newBlogger = newBlogger;
exports.loginResult = loginResult;

