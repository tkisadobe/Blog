/**
 * Created by lihaiyan on 16/7/15.
 */
var mongoClient = require("mongodb").MongoClient;
var querystring = require("querystring");
var url = require("url");
var md5 = require("md5");
var util = require('util');
var ObjectID = require("mongodb").ObjectID;
var URL = "mongodb://localhost:27017/test";
var fs = require("fs"),
    formidable = require("formidable");
var handlebars = require('handlebars');
var blog_util=require('./blog_util');

var log=blog_util.log;
var uniq=blog_util.uniq;


function render_template(template_str, template_data, response) {
    fs.readFile(template_str, 'utf-8', function (error, source) {
        handlebars.registerHelper('custom_title', function (title) {
            var words = title.split(' ');
            for (var i = 0; i < words.length; i++) {
                if (words[i].length > 4) {
                    words[i] = words[i][0].toUpperCase() + words[i].substr(1);
                }
            }
            title = words.join(' ');
            return title;
        });
        var html = '';
        var template = handlebars.compile(source);
        html = template(template_data);
        response.writeHead(200, {"Content-type": "text/html"});
        response.write(html);
        response.end();
    });
}


function indexPage(request, response, items, postData) {
    log(request);
    log(postData);
    // var template = Handlebars.compile('hml/index.html');
    // 这里传值
    console.log('index',util.inspect(items, false, null));
    var data = {
        title: '简单的博客',
        author: '@lhy',
        tags: ['express', 'node', 'javascript'],
        articles:items
    };
    // 这里把需要模版地址写好，注意是相对于本文件的
    render_template('html/index.html', data, response);
}

function selectBlog(request, response, postData) {
    log(request);
    log(postData);
    var data = {
        title: '查找文章',
        author: '@lhy',
        tags: ['express', 'node', 'javascript']
    };
    render_template('html/selectBlog.html', data, response);

}

function writeBlog(request, response, postData) {
    log(request);
    log(postData);
    var data={
        title:'随笔',
        author:'@lhy',
        tags: ['express', 'node', 'javascript']
    };
    render_template('html/writeBlog.html', data, response);
}

function login(request, response, postData) {
    log(request);
    log(postData);
    var data={
        title:'登陆',
        author:'@lhy',
        tags: ['express', 'node', 'javascript']
    };
    render_template('html/login.html', data, response);
}

function adminLogin(request,response,postData) {
    log(request);
    log(postData);
    var data={
        title:'管理员登陆',
        author:'@lhy',
        tags: ['express', 'node', 'javascript']
    };
    render_template('html/admin_homePage.html', data, response);
}

function adminLoginJudge(request, response, postData) {
    log(request);
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var admin=db.collection("admin");
            checkPassword(admin,postData.username,postData.password,function (result) {
                if(result){
                    insertSessions(admin,postData);
                    response.writeHead(200,{"Content-Type":"text/html","Set-Cookie":"message="+md5(postData.username+postData.password)});
                    response.write("Hello "+postData.username+ '</br>' + '<a href="/showAdminHomePage">' + "Go to adminHomePage" + '</a>');
                    response.end();
                }
                else{
                    response.writeHead(200,{"Content-Type":"text/html"});
                    response.write("admin login failed");
                    response.end();
                }
            })
        }
    })
}
function adminHomePage(request,response,items,articles,result) {
    log(request);
    var data={
        title:'管理员登陆',
        author:'@lhy',
        tags: ['express', 'node', 'javascript'],
        items:items,
        result:result,
        articles:articles
    };
    render_template('html/admin_homePage.html', data, response);
}

function showAdminHomePage(request,response,postData) {
    log(postData);
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var page=db.collection('page');
            var user=db.collection('user');
            var admin=db.collection('admin');
            var Cookies={};
            request.headers.cookie && request.headers.cookie.split(';').forEach(function (Cookie) {
                var parts=Cookie.split('=');
                Cookies[parts[0].trim()]=(parts[1] || '').trim();
            });
            admin.findOne({"sessions.md5Message":Cookies.message},function (e,result) {
                if(e){
                    console.log(e);
                }
                else{
                    console.log("result的内容:",result);
                    user.find({},{name:1}).toArray(function (e,items) {
                        if(e){
                            console.log(e);
                        }
                        else{
                            page.find({},{title:1}).toArray(function (e,articles) {
                                if(e){
                                    console.log(e);
                                }
                                else{
                                    console.log("articles:",articles);
                                }
                                adminHomePage(request,response,items,articles,result);
                            });
                            console.log("items:",items);
                        }
                    })
                }
            })
        }
    })
}

function indexFindBlog(request, response,postData) {
    mongoClient.connect(URL, function (e, db) {
        if (e) {
            console.log('error',e);
        }
        else {
            var page = db.collection("page");
            var reqData = querystring.parse(url.parse(request.url).query);
            var objectID = new ObjectID(reqData._id);
            console.log('objectID:',objectID);
            page.findOne({_id: objectID}, function (e, result) {
                if (e) {
                    console.log(e);
                }
                else {
                    indexShowBlog(request,response, result);
                }
            });
        }
    });
}
function findBlog(request, response,postData) {
    mongoClient.connect(URL, function (e, db) {
        if (e) {
            console.log('error',e);
        }
        else {
            var page = db.collection("page");
            var reqData = querystring.parse(url.parse(request.url).query);
            var objectID = new ObjectID(reqData._id);
            console.log('objectID:',objectID);
            page.findOne({_id: objectID}, function (e, result) {
                if (e) {
                    console.log(e);
                }
                else {
                    showBlog(request,response, result);
                }
            });
        }
    });
}

function findUserInfo(request, response,postData) {
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var user=db.collection('user');
            var page=db.collection('page');
            var reqData=querystring.parse(url.parse(request.url).query);
            var objectID=new ObjectID(reqData._id);
            user.findOne({_id:objectID},function (e,result) {
                if(e){
                    console.log(e);
                }
                else{
                    page.find({author:result.name},{title:1}).toArray(function (e,articles) {
                        if(e){
                            console.log(e);
                        }
                        else{
                            console.log("articles:",articles);
                            userInfo(request,response,result,articles);
                        }
                    })
                }
            })
            
        }
    })
}

function userInfo(request,response,result,articles) {
    var data={
        title:'用户信息界面',
        author:'@lhy',
        tags: ['express', 'node', 'javascript'],
        result:result,
        articles:articles
    };
    render_template('html/user_Info.html', data, response);
}

function showHomePage(request,response,postData) {
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var page=db.collection('page');
            var user=db.collection('user');
            var Cookies={};
            request.headers.cookie && request.headers.cookie.split(';').forEach(function (Cookie) {
                var parts=Cookie.split('=');
                Cookies[parts[0].trim()]=(parts[1] || '').trim();
            });
            console.log("Cookies.message:",Cookies.message);
            user.findOne({"sessions.md5Message":Cookies.message},function (e,result) {
                if(e){
                    console.log(e);
                }
                else{
                    console.log("result的内容:",result);
                    //result是当前登陆的用户
                    page.find({author:result.name},{title:1,body:1,date:1}).toArray(function (e,items) {
                        if(e){
                            console.log(e);
                        }
                        else{
                            console.log("items的内容:",items);
                            user.find({name:result.name},{tag:1}).toArray(function (e,tags) {
                                if(e){console.log(e);}
                                else{
                                    homePage(request,response,items,tags,result);
                                    //items是该用户发表的文章列表,tags存放了所有不重复的标签
                                }
                            });
                        }
                    });
                }
            });
        }
    })
}
function loginJudge(request, response, postData) {
    mongoClient.connect(URL, function (e, db) {
        if (e) {
            console.log(e);
        }
        else {
            var user = db.collection("user");
            checkPassword(user, postData.username, postData.password, function (result) {
                if (result) {
                    insertSessions(user, postData);
                    response.writeHead(200, {"Content-Type": "text/html", "Set-Cookie": "message=" + md5(postData.username+postData.password)});
                    response.write("Hello "+postData.username + '</br>' + '<a href="/showHomePage">' + "Go to homePage" + '</a>');
                    response.end();
                }
                else {
                    response.writeHead(200, {"Content-Type": "text/html"});
                    response.write("login failed");
                    response.end();
                }
            });
        }
    });
}

function homePage(request,response,items,tags,result) {
    var data={
        title:"个人主页",
        author:'@lhy',
        result:result,
        articles:items,
        tags:uniq(tags[0]['tag'])
    };
    render_template('html/homePage.html',data,response);
}

function showBlog(request, response, result) {
    var data = {
        author: '@lhy',
        tags: ['express', 'node', 'javascript'],
        result: result
    };
    //console.log('this is null',util.inspect(result, false, null));
    render_template('html/showBlog.html', data, response);
}

function indexShowBlog(request, response, result) {
    var data = {
        author: '@lhy',
        tags: ['express', 'node', 'javascript'],
        result: result
    };
    render_template('html/indexShowBlog.html', data, response);
}


function classification(request,response,postData) {
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var page=db.collection('page');
            var user=db.collection('user');
            var reqData=querystring.parse(url.parse(request.url).query);
            console.log("reqData:",reqData);
            console.log("reqData.tag:",reqData.tag);
            page.find({tag:reqData.tag},{title:1}).toArray(function (e,items) {
                if(e){
                    console.log(e);
                }
                else{
                    console.log("items",items);
                    classPage(request, response, items, reqData);
                }
            })
        }
    })
}

function classPage(request,response,items,reqData) {
    var data = {
        title: '简单的博客',
        author: '@lhy',
        tags: ['express', 'node', 'javascript'],
        items:items,
        reqData:reqData
    };
    render_template('html/classPage.html', data, response);
}


function register(request, response, postData) {
    var data={
        title:'注册',
        author:'@lhy',
        tags: ['express', 'node', 'javascript']
    };
    render_template('html/register.html', data, response);
}


function load(request, response, postData) {
    mongoClient.connect(URL, function (e, db) {
        if (e) {
            console.log(e);
        }
        else {
            var page = db.collection('page');
            var user = db.collection('user');
            var titleList = "";
            page.find({}, {title: 1}).toArray(function (e, items) {
                if (e) {
                    console.log(e);
                }
                else {
                     for (var i = 0; i < items.length; i++) {
                         titleList +=
                             '<a href=/findBlog?_id=' + items[i]._id + '>' + '<li>' + items[i].title + '</li>' + '</a>';
                     }
                    indexPage(request, response, items, postData);
                }
            });
        }
    });
}

function selectOneBlog(request, response, postData) {
    mongoClient.connect(URL, function (e, db) {
        if (e) {
            console.log(e);
        }
        else {
            var page = db.collection("page");
            var reqData = querystring.parse(url.parse(request.url).query);
            page.findOne({title: reqData.title}, function (e, result) {
                if (e) {
                    console.log(e);
                }
                else {
                    if (result) {
                        console.log(result);
                        showBlog(request,response,result);
                    }
                    else {
                        response.writeHead(200, {"Content-Type": "text/plain"});
                        response.write("Didn't found");
                        response.end();
                    }
                }
            });
        }
    });
}

function insertPage(request, response, postData) {
    mongoClient.connect(URL, function (e, db) {
        if (e) {
            console.log(e);
        }
        else {
            var page = db.collection("page");
            var user = db.collection("user");
            var Cookies = {};
            request.headers.cookie && request.headers.cookie.split(';').forEach(function (Cookie) {
                var parts = Cookie.split('=');
                Cookies[parts[0].trim()] = (parts[1] || '').trim();
            });
            user.findOne({"sessions.md5Message": Cookies.message}, {}, function (e, result) {
                if (e) {
                    console.log(e);
                }
                else{
                 var data = {
                     title: postData.title,
                     body: postData.body,
                     date: new Date(),
                     author: result.name,
                     tag: postData.tag
                 };
                    page.insert(data, function (e, result) {
                        if (e) {
                         console.log(e);
                        }
                        else {
                            response.writeHead(200, {"Content-Type": "text/html"});
                            response.write("add page succeed" + '</br>' + '<a href="/showHomePage">' + "Go back to homePage" + '</a>');
                            response.end();
                     }
                 });
                    user.find({name:result.name},{tag:1}).toArray(function (e,tags) {
                        if(e){
                            console.log(e);
                        }
                        else{
                            console.log("postData.tag:",postData.tag);
                            console.log("result.name:",result.name);
                            for(var i=0;i<tags.length;i++){
                                if(postData.tag!=tags[i].tag){
                                    user.update({name:result.name},{$push:{tag:postData.tag}},function (e,res) {
                                        if(e){
                                            console.log(e);
                                        }
                                        else{
                                            console.log(res);
                                        }
                                    })
                                }
                            }
                        }
                    })
                 }
            });
        }
    });
}


function removePage(request, response) {
    var reqStr = url.parse(request.url).query;
    var mongodb = require("mongodb");
    var objectID = mongodb.ObjectID(reqStr);
    mongoClient.connect(URL, function (e, db) {
        if (e) {
            console.log(e);
        }
        else {
            var page = db.collection("page");
            page.remove({_id: objectID}, function (e, result) {
                response.writeHead(200, {"Content-Type": "text/html"});
                if (e) {
                    response.write("delete err");
                }
                else {
                    response.write("delete succeed" + '</br>' + '<a href="/load">' + "Go back to index" + '</a>');
                }
                response.end();
            })
        }
    })
}

function updatePage(request, response, postData) {
    var reqStr = url.parse(request.url).query;
    var objectid= new ObjectID(reqStr);
    mongoClient.connect(URL, function (e, db) {
        if (e) {
            console.log(e);
        }
        else {
            var page = db.collection("page");
            page.update({_id: objectid}, {$set: {body: postData.body}}, function (e, result) {
                response.writeHead(200, {"Content-Type": "text/html"});
                if (e) {
                    response.write("update err");
                }
                else {
                    response.write("update succeed" + '</br>' + '<a href="/load">' + "Go back to index" + '</a>');
                }
                response.end();
            })
        }
    })
}

function updateUserInfo(request, response, postData) {
    var reqStr=url.parse(request.url).query;
    var objectid=new ObjectID(reqStr);
    console.log("reqStr:",reqStr);
    console.log("objectid:",objectid);
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var user=db.collection('user');
            user.update({_id:objectid},{$set:{password:postData.body}},function (e,result) {
                if(e){
                    console.log(e);
                    response.write("update password error");
                }
                else{
                    response.writeHead(200,{"Content-Type":"text/html"});
                    response.write("update succeed" + '</br>' + '<a href="/showAdminHomePage">' + "Go back to adminHomePage" + '</a>');
                }
                response.end();
            })
        }
    })
}

function insertUser(request, response, postData) {
    var data = {name: postData.username, password: postData.password,sessions:null};
    mongoClient.connect(URL, function (e, db) {
        if (e) {
            console.log(e);
        }
        else {
            var user = db.collection("user");
            user.findOne({name: postData.username}, function (e, result) {
                console.log("result:",result);
                if (result == null) {
                    user.insert(data, function (e, result) {
                        if (e) {
                            console.log(e);
                        }
                        else {
                            console.log("add user succeed");
                            response.writeHead(200, {"Content-type": "text/html"});
                            response.write("register succeed! Hello "+postData.username + '</br>' + '<a href="/login">' + "Go to login" + '</a>');
                            response.end();
                        }
                    });
                }
                else {
                    response.writeHead(200, {"Content-type": "text/html"});
                    response.write("username has exits");
                    response.end();
                }
            });
        }
    })
}

function checkPassword(collection, name, password, cb) {
    console.log("password:" + password);
    collection.findOne({name: name}, {password: 1}, function (e, result) {
        if (e) {
            console.log(e);
            return cb(false);
        }
        else {
            console.log(result);
            if (result.password == password) {
                return cb(true);
            }
            else {
                return cb(false);
            }
        }
    });
}

function insertSessions(collection, postData) {
    var md5M = md5(postData.username+postData.password);
    collection.update({name:postData.username},{$set:{sessions:{md5Message:md5M,md5Time:new Date()}}},
        function(e,res){
            if(e){
                console.log(e);
                return false;
            }else{
                console.log("insertSessions success");
                return true;
            }
        });
}

function uploadPicture(request,response,postData) {
    mongoClient.connect(URL,function (e,db) {
        if(e){
            console.log(e);
        }
        else{
            var user=db.collection('user');
            var form = new formidable.IncomingForm();
            
            form.parse(request,function (e,fields,files) {
                if(e){
                    console.log(e);
                }
                else{
                    fs.renameSync(files.upload.path, "/Users/lihaiyan/Downloads/1.jpg");
                    response.writeHead(200,{"Content-Type":"text/html"});
                    response.write("receive image:<br/>");
                    response.write("<img src='/show' />");
                    response.end();
                }
            })
        }
    });
}

function showPicture(request,response,postData) {
    fs.readFile("/Users/lihaiyan/Downloads/1.JPG","binary",function (e,file) {
        if(e){
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        }
        else{
            response.writeHead(200, {"Content-Type": "image/png"});
            response.write(file, "binary");
            response.end();
        }
    })
}

exports.writeBlog = writeBlog;
exports.login = login;
exports.loginJudge = loginJudge;
exports.register = register;
exports.load = load;
exports.findBlog = findBlog;
exports.insertPage = insertPage;
exports.removePage = removePage;
exports.insertUser = insertUser;
exports.updatePage = updatePage;
exports.selectBlog = selectBlog;
exports.selectOneBlog = selectOneBlog;
exports.adminLogin=adminLogin;
exports.adminLoginJudge=adminLoginJudge;
exports.homePage=homePage;
exports.showHomePage=showHomePage;
exports.classification=classification;
exports.showAdminHomePage=showAdminHomePage;
exports.findUserInfo=findUserInfo;
exports.indexFindBlog=indexFindBlog;
exports.updateUserInfo=updateUserInfo;
exports.uploadPicture=uploadPicture;
exports.showPicture=showPicture;