/**
 * Created by lihaiyan on 16/7/9.
 */


var mongoClient=require("mongodb").MongoClient;
var md5=require("md5");
var ObjectID=require("mongodb").ObjectID;
var querystring = require("querystring"),
    fs = require("fs"),
    formidable = require("formidable");
var URL = "mongodb://localhost:27017/test";



function start(response) {
    console.log("Request handler 'start' was called.");
    // console.log(response);
    fs.readFile('./index.html', function (err, html) {
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
    fs.readFile('./login.html',function (err,html) {
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

function register(response,request) {
    console.log("register");
    fs.readFile('./register.html',function (err,html) {
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
exports.upload = upload;
exports.show = show;