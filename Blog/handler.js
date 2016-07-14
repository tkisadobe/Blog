/**
 * Created by lihaiyan on 16/7/9.
 */


var mongoClient=require("mongodb").MongoClient;
var md5=require("md5");
var url = require("url");
var ObjectID=require("mongodb").ObjectID;
var querystring = require("querystring"),
    fs = require("fs"),
    formidable = require("formidable");
var URL = "mongodb://localhost:27017/test";

function start(response) {
    console.log("Request handler 'start' was called.");
    // console.log(response);
    fs.readFile('./html/index.html', function (err, html) {
        if (err) {
            // if error response err
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(err.message);
            response.end();
        }
        else {
            // if not error response the file
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(html);
            response.end();
        }
    });
}

function login(response, request) {
    console.log("login");
    fs.readFile('./html/login.html',function (err,html) {
        if(err){
            response.writeHead(200,{"Content-Type":"text/html"});
            response.write(err.message);
            response.end();
        }
        else{
            response.writeHead(200,{"Content-Type":"text/html"});
            response.write(html);
            response.end();
        }
    });
}

function writeBlog(response) {
    console.log("write a blog");
    fs.readFile('./html/writeBlog.html',function (err,html) {
        if(err){
            response.writeHead(200,{"Content-type":"text/html"});
            response.write(err.message);
            response.end();
        }
        else{
            response.writeHead(200,{"Content-Type":"text/html"});
            response.write(html);
            response.end();
        }
    });
}

function InsertPage(request,response,postData) {
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var page=db.collection("page");
            var user=db.collection("user");
            var Cookies={};
            console.log(request.headers.cookie);
            request.headers.cookie && request.headers.cookie.split(';').foreach(function (Cookie) {
                var parts=Cookie.split('=');
                Cookies[parts[0].trim()]=(parts[1] || '').trim();
            });
            console.log();
            user.findOne({sessions:Cookies.message},{name:1},function (e,result) {
                console.log(result);
                var data={title:postData.title,body:postData.body,date:new Date(),author:result.name};
                page.insert(data,function (e,result) {
                    if(e){
                        console.log(e);
                    }
                    else{
                        console.log(result);
                        response.writeHead(200,{"Content-Type":"text/html"});
                        response.write("提交成功");
                        response.end();
                        db.close();
                    }
                })
            })
        }
    })

}

function loginjudge(response,postData) {
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var user=db.collection("user");
            var result=checkPassword(user,postData.username,postData.password,function (result) {
                if(result){
                    insertSessions(user,postData);
                    response.writeHead(200,{"Content-type":"text/html","Set-Cookie":"message"+md5(postData)});
                    response.write("恭喜登陆成功,返回首页:"+'<a href="/load">'+"start"+'</a>');
                    response.end();
                }
                else{
                    response.writeHead(200,{"Content-type":"text/html"});
                    response.write("登陆失败");
                    response.end();
                }
            });
        }
    });
}
function insertSessions(collection,postData) {
    var md5M=(postData);
    collection.insert({name:postData.username},{sessions:[{md5Message:md5M},{md5Time:new Data()}]},
    function (e,result) {
        if(e){
            console.log(e);
            return false;
        }
        else{
            if(result.n==1){
                console.log("insertSessions succeed");
                return true;
            }
            else{
                return false;
            }
        }
    })
}

function checkPassword(collection,name,password,cb) {
    console.log("password is "+password);
    collection.findOne({name:name},{password:1},function (e,result) {
        if(e){
            console.log(e);
            return cb(false);
        }
        else{
            console.log(result);
            if(result.password==password){
                console.log("***");
                return cb(true);
            }
            else{
                return cb(false);
            }
        }
    });
}

function register(response,request) {
    console.log("register");
    fs.readFile('./html/register.html',function (err,html) {
        if(err){
            response.writeHead(200,{"Content-Type":"text/html"});
            response.write(err.message);
            response.end();
        }
        else{
            response.writeHead(200,{"Content-Type":"text/html"});
            response.write(html);
            response.end();
        }
    });
    
}

function InsertUser(request,response,postData) {
    var reqstr=url.parse(request.url).query;
    var reqdata=querystring.parse(reqstr);
    var data={name:reqdata.username,password:reqdata.password,age:reqdata.age};
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var user=db.collection("user");
            user.findOne({name:reqdata.username},function (e,result) {
                if(result==null){
                    collection.insert(data,function (e,result) {
                        if(e){
                            console.log(e);
                        }
                        else{
                            console.log("用户注册成功");
                            response.writeHead(200,{"Content-Type":"text/html"});
                            response.write("用户注册成功");
                            response.end();
                        }
                    });
                }
                else{
                    response.writeHead(200,{"Content-Type":"text/html"});
                    response.write("用户名已存在");
                    response.end();
                }
            })
        }
    })
}

function load(request,response,postData) {
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var user=db.collection('user');
            var page=db.collection('page');
            var titleList="";
            
            var sign=0;
            page.find({},{title:1}).toArray(function (e,items) {
                if(e){
                    console.log(e);
                }
                else{
                    for(var i=0;i<items;i++){
                        titleList+='<a href="/findBlogger?_id='+items[i]._id+'>'+'<li>'+items[i].title+'</li>'+'</a>';
                    }
                    start(response);
                }
            })

        }
    })
}


function upload(response, request) {
    console.log("Request handler 'upload' was called.");

    var form = new formidable.IncomingForm();
    console.log("about to parse");
    form.parse(request, function (error, fields, files) {
        console.log("parsing done");
        fs.renameSync(files.upload.path, "/Users/lihaiyan/Downloads/1.jpg");
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write("received image:<br/>");
        response.write("<img src='/show' />");
        response.end();
    });
}

function show(response) {
    console.log("Request handler 'show' was called.");
    fs.readFile("/Users/lihaiyan/Downloads/1.JPG", "binary", function (error, file) {
        if (error) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        } else {
            response.writeHead(200, {"Content-Type": "image/png"});
            response.write(file, "binary");
            response.end();
        }
    });
}
exports.start = start;
exports.login=login;
exports.register=register;
exports.load=load;
exports.loginjudge=loginjudge;
exports.writeBlog=writeBlog;
exports.InsertPage=InsertPage;
exports.InsertUser=InsertUser;

exports.upload = upload;
exports.show = show;