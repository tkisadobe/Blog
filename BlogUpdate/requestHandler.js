/**
 * Created by lihaiyan on 16/7/15.
 */
var mongoClient=require("mongodb").MongoClient;
var querystring=require("querystring");
var url=require("url");
var md5=require("md5");
var ObjectID=require("mongodb").ObjectID;
var URL="mongodb://localhost:27017/test";
var querystring = require("querystring"),
    fs = require("fs"),
    formidable = require("formidable");

function indexPage(request,response,titleList,postData) {
    var body = '<html>' +
        '<head>' +
        '<meta http-equiv="Content-Type" content="text/html; '+
        'charset=UTF-8" />' +
        '</head>' +
        '<body>' +
        '<h1 >简单的博客</h1>'+
        '<a href="/register">'+"注册"+'</a>'+'</br>'+
        '<a href="/login">'+"登陆"+'</a>'+'</br>'+
        '<a href="/writeBlog">'+"写博客"+ '</a>'+'</br>'+
        '<a href="/selectBlog">'+"找博客"+ '</a>'+
        '<li/>'+
        '<ul>' + '<li value="hot blogger">'+'</li>'+ titleList + '</ul>' +
        '</body>' +
        '</html>';
    response.writeHead(200, {"Content-type": "text/html" ,});
    response.write(body);
    response.end();
}

function selectBlog(request,response,postData) {
    var body='<html>' +
        '<head>' +
        '<meta http-equiv="Content-Type" content="text/html; ' +
        'charset=UTF-8" />' +
        '</head>' +
        '<body>' +
        '<h1>查找喜欢的文章</h1>'+
        '<form action="/selectOneBlog" method="post">' +
        '<input type="text" placeholder="标题" name="title"/>' +'</br>'+
        '<input type="submit" value="查找">' +
        '</form>' +
        '</body>' +
        '</html>';
    response.writeHead(200, {"Content-type": "text/html"});
    response.write(body);
    response.end();
}


function writeBlog(request,response,postData) {
    var body = '<html>' +
        '<head>' +
        '<meta http-equiv="Content-Type" content="text/html; ' +
        'charset=UTF-8" />' +
        '</head>' +
        '<body>' +
        '<h1>随笔</h1>'+
        '<form action="/insertPage" method="post">' +
        '<input type="text" placeholder="标题" name="title"/>' +'</br>'+
        '<textarea placeholder="内容" name="body"></textarea>' +'</br>'+
        '<input type="submit" value="提交">' +
        '</form>' +
        '</body>' +
        '</html>';
    response.writeHead(200, {"Content-type": "text/html"});
    response.write(body);
    response.end();
}

function login(request,response,postData) {
    var body = '<html>'+
        '<head>'+
        '<meta http-equiv="CONTENT-TYPE" content="text/html" charset="utf-8"/>'+
        '</head>'+
        '<body>'+
        '<h1>欢迎来到登陆界面</h1>'+
        '<p>请输入用户名和密码:</p>'+
        '<form action="/loginJudge" method="post">'+
        '<input type="text" placeholder="用户名" name="username" id="username">'+' </input>'+'</br>'+
        '<input type="text" placeholder="密码" name="password" id="password">'+' </input>'+'</br>'+
        '<input type="submit" onsubmit="encrypt()" value="登陆">'+' </input>'+
        '</form>'+
        '</body>'+
        '</html>';
    response.writeHead(200,{"Content-type":"text/html"});
    response.write(body);
    response.end();
}


function loginJudge(request,response,postData) {
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var user=db.collection("user");
            var result=checkPassword(user,postData.username,postData.password,function (result) {
                if(result){
                    insertSessions(user,postData);
                    response.writeHead(200,{"Content-Type":"text/html","Set-Cookie":"message="+md5(postData)});
                    response.write("login succeed"+'</br>'+'<a href="/load">'+"Go back indexPage"+'</a>');
                    response.end();
                }
                else{
                    response.writeHead(200,{"Content-Type":"text/html"});
                    response.write("login failed");
                    response.end();
                }
            });
        }
    });
}

function register(request,response,postData) {
    var body = '<html>'+
        '<head>'+
        '<meta http-equiv="CONTENT-TYPE" content="text/html" charset="utf-8"/>'+
        '</head>'+
        '<body>'+
        '<h1>欢迎来到注册界面</h1>'+
        '<p>请填写一下信息:</p>'+
        '<form action="/insertUser">'+
        '<input type="text" placeholder="用户名" name="username"">'+ '</input>'+'</br>'+
        '<input type="text" placeholder="密码" name="password">'+' </input>'+'</br>'+
        '<input type="submit" value="注册">'+' </input>'+
        '</form>'+
        '</body>'+
        '</html>'
    response.writeHead(200,{"Content-type":"text/html"});
    response.write(body);
    response.end();
}

function showBlog(response,result) {
    var del = '<a href=/removePage?' + result._id + '>' + "delete" + '</a>';
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
        del+'</br>'+
        '</br>'+
        '<form action="/updatePage" method="post">'+
        '<textarea placeholder="更新的文本内容" name="body"></textarea></br>'+
        '<input type="submit" value="update">'+
        '</form>'+
        '</body>' +
        '</html>';
    response.writeHead(200, {"Content-type": "text/html"});
    response.write(body);
    response.end();
}

function load(request,response,postData) {
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var page=db.collection('page');
            var user=db.collection('user');
            var titleList="";
            var sign=0;
            page.find({},{title:1}).toArray(function (e,items) {
                if(e){
                    console.log(e);
                }
                else{
                    for(var i=0;i<items.length;i++){
                        titleList+=
                            '<a href=/findBlog?_id='+items[i]._id+'>'+'<li>'+items[i].title+'</li>'+'</a>';
                    }
                    indexPage(request,response,titleList,postData,sign);
                }
            });
        }
    });
}
function findBlog(request,response) {
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var page=db.collection("page");
            var reqData=querystring.parse(url.parse(request.url).query);
            console.log(reqData);
            var objectID=new ObjectID(reqData._id);
            page.findOne({_id:objectID},function (e,result) {
                if(e){
                    console.log(e);
                }
                else{
                    console.log(result);
                    showBlog(response,result);
                    db.close();
                }
            });
        }
    });
}


function selectOneBlog(request,response,postData) {
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var page=db.collection("page");
            page.find({title:postData.title},function (e,result) {
                if(e){
                    console.log(e);
                }
                else{
                     console.log(result);
                    if(result) {
                        showBlog(response, result);
                        db.close();
                    }
                    else{
                        response.writeHead(200,{"Content-Type":"text/plain"});
                        response.write("Don't find");
                        response.end();
                        db.close();
                    }
                }
            });

        }
    });
}

function insertPage(request,response,postData) {
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var page=db.collection("page");
            var user=db.collection("user");
            var Cookies={};
            console.log(request.headers.cookie);
            request.headers.cookie && request.headers.cookie.split(';').forEach(function (Cookie) {
                var parts=Cookie.split('=');
                Cookies[parts[0].trim()]=(parts[1] || '').trim();
            });
            console.log(Cookies.message);
            user.findOne({sessions:Cookies.message},{},function (e,result) {
                console.log(result);
                var ownerId = new ObjectID(result._id);
                var data={title:postData.title,body:postData.body,date:new Date(),author:ownerId};
                page.insert(data,function (e,result) {
                    if(e){
                        console.log(e);
                    }
                    else{
                        console.log(result);
                        response.writeHead(200,{"Content-Type":"text/html"});
                        response.write("add page succeed"+'</br>'+'<a href="/load">'+"Go back indexPage"+'</a>');
                        response.end();
                        db.close();
                    }
                });
            });
        }
    });

}


function removePage(request,response) {
    var reqStr=url.parse(request.url).query;
    var mongodb=require("mongodb");
    var objectID=mongodb.ObjectID(reqStr);
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var page=db.collection("page");
            page.remove({_id:objectID},function (e,result) {
                response.writeHead(200,{"Content-Type":"text/html"});
                if(e){
                    response.write("delete err");
                }
                else{
                    response.write("delete succeed"+'</br>'+'<a href="/load">'+"Go back indexPage"+'</a>');
                }
                response.end();
            })
        }
    })
    
}
function updatePage(request,response,postData) {
    console.log(postData.body);
    var reqStr=url.parse(request.url).query;
    var mongodb=require("mongodb");
    var objectID=mongodb.ObjectID(reqStr);
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var page=db.collection("page");
            console.log(objectID);
            page.update({_id:objectID},{$set:{body:postData.body}},function (e,result) {
                response.writeHead(200,{"Content-Type":"text/html"});
                if(e){
                    response.write("update err");
                }
                else{
                    response.write("update succeed"+'</br>'+'<a href="/load">'+"Go back indexPage"+'</a>')
                }
                response.end();
            })
        }
    })
}

function insertUser(request,response,postData) {
    var reqStr=url.parse(request.url).query;
    var reqData=querystring.parse(reqStr);
    var data={name:reqData.username,password:reqData.password};
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var user=db.collection("user");
            user.findOne({name: reqData.username},function (e,result) {
                if(result==null){
                    user.insert(data,function (e,result) {
                        if(e){
                            console.log(e);
                        }
                        else{
                            console.log("add user succeed");
                            response.writeHead(200,{"Content-type":"text/html"});
                            response.write("register succeed"+'</br>'+'<a href="/load">'+"Go back indexPage"+'</a>');
                            response.end();
                        }
                    });
                }
                else{
                    response.writeHead(200,{"Content-type":"text/html"});
                    response.write("username has exits");
                    response.end();
                }
            });
        }
    })
}

function checkPassword(collection,name,password,cb) {
    console.log("password:" +password);
    collection.findOne({name:name},{password:1},function (e,result) {
        if(e){
            console.log(e);
            return cb(false);
        }
        else{
            console.log(result);
            if(result.password==password){
                console.log("**********");
                return cb(true);
            }
            else {
                return cb(false);
            }
        }
    });
}

function insertSessions(collection,postData) {
    var md5M=(postData);
    collection.insert({name:postData.username},{sessions:[{md5Message:md5M},{md5Time:new Date()}]},function (e,result) {
        if(e){
            return false;
        }
        else{
            if(result.n==1){
                console.log("insert sessions succeed")
                return true;
            }
            else{
                return false;
            }
        }
    })
}

exports.writeBlog=writeBlog;
exports.login=login;
exports.loginJudge=loginJudge;
exports.register=register;
exports.load=load;
exports.findBlog=findBlog;
exports.insertPage=insertPage;
exports.removePage=removePage;
exports.insertUser=insertUser;
exports.updatePage=updatePage;
exports.selectBlog=selectBlog;
exports.selectOneBlog=selectOneBlog;