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


function render_template(template_str, template_data, response) {
    fs.readFile(template_str, 'utf-8', function (error, source) {
        //console.log('err', error);
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


function indexPage(request, response, titleList, postData) {
    // var template = Handlebars.compile('hml/index.html');
    // 这里传值
    console.log('index',util.inspect(titleList, false, null));
    var data = {
        title: '简单的博客',
        author: '@lhy',
        tags: ['express', 'node', 'javascript'],
        articles:titleList
    };
    // 这里把需要模版地址写好，注意是相对于本文件的
    render_template('html/index.html', data, response);
}

function selectBlog(request, response, postData) {
    var data = {
        title: '查找文章',
        author: '@lhy',
        tags: ['express', 'node', 'javascript']
    };
    render_template('html/selectBlog.html', data, response);

}


function writeBlog(request, response, postData) {
    var data={
        title:'随笔',
        author:'@lhy',
        tags: ['express', 'node', 'javascript']
    };
    render_template('html/writeBlog.html', data, response);
}

function login(request, response, postData) {
    var data={
        title:'登陆',
        author:'@lhy',
        tags: ['express', 'node', 'javascript']
    };
    render_template('html/login.html', data, response);

}


function loginJudge(request, response, postData) {
    mongoClient.connect(URL, function (e, db) {
        if (e) {
            console.log(e);
        }
        else {
            var user = db.collection("user");
            var result = checkPassword(user, postData.username, postData.password, function (result) {
                if (result) {
                    insertSessions(user, postData);
                    response.writeHead(200, {"Content-Type": "text/html", "Set-Cookie": "message=" + md5(postData)});
                    response.write("login succeed" + '</br>' + '<a href="/load">' + "Go back indexPage" + '</a>');
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

function register(request, response, postData) {
    var data={
        title:'注册',
        author:'@lhy',
        tags: ['express', 'node', 'javascript']
    };
    render_template('html/register.html', data, response);
}

function showBlog(request, response, result) {
    var data = {
        author: '@lhy',
        tags: ['express', 'node', 'javascript'],
        result: result,
        request:request
    };
    //console.log('this is null',util.inspect(result, false, null));
    render_template('html/showBlog.html', data, response);
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
function findBlog(request, response,postData) {
    mongoClient.connect(URL, function (e, db) {
        if (e) {
            console.log('error',e);
            response.write('fix');
        }
        else {
            var page = db.collection("page");
            var reqData = querystring.parse(url.parse(request.url).query);
            console.log('req',reqData);
            var objectID = new ObjectID(reqData._id);
            page.findOne({_id: objectID}, function (e, result) {
                if (e) {
                    console.log(e);
                }
                else {
                    insertSessions(page,postData);
                    console.log(util.inspect(result, false, null));
                    showBlog(request,response, result);
                    db.close();
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
            page.find({title: postData.title}, function (e, result) {
                if (e) {
                    console.log(e);
                }
                else {
                    console.log(result);
                    if (result) {
                        showBlog(response, result);
                        db.close();
                    }
                    else {
                        response.writeHead(200, {"Content-Type": "text/plain"});
                        response.write("Don't find");
                        response.end();
                        db.close();
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
            console.log(request.headers.cookie);
            request.headers.cookie && request.headers.cookie.split(';').forEach(function (Cookie) {
                var parts = Cookie.split('=');
                Cookies[parts[0].trim()] = (parts[1] || '').trim();
            });
            console.log(Cookies.message);
            user.findOne({sessions: Cookies.message}, {}, function (e, result) {
                console.log(result);
                var ownerId = new ObjectID(postData._id);
                var data = {
                    title: postData.title,
                    body: postData.body,
                    date: new Date(),
                    author: ownerId,
                    tag: postData.tag
                };
                page.insert(data, function (e, result) {
                    if (e) {
                        console.log(e);
                    }
                    else {
                        console.log(result);
                        response.writeHead(200, {"Content-Type": "text/html"});
                        response.write("add page succeed" + '</br>' + '<a href="/load">' + "Go back indexPage" + '</a>');
                        response.end();
                        db.close();
                    }
                });
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
                    response.write("delete succeed" + '</br>' + '<a href="/load">' + "Go back indexPage" + '</a>');
                }
                response.end();
            })
        }
    })
}

function updatePage(request, response, postData) {
    var reqStr = url.parse(request.url).query;
    console.log("reqStr的内容:",reqStr);
    var mongodb = require("mongodb");
    var objectId = mongodb.ObjectID(reqStr._id);
    mongoClient.connect(URL, function (e, db) {
        if (e) {
            console.log(e);
        }
        else {
            var page = db.collection("page");
            page.update({_id: objectId}, {$set: {body: postData.body}}, function (e, result) {
                response.writeHead(200, {"Content-Type": "text/html"});
                if (e) {
                    response.write("update err");
                }
                else {
                    response.write("update succeed" + '</br>' + '<a href="/load">' + "Go back indexPage" + '</a>');
                }
                response.end();
            })
        }
    })
}

function insertUser(request, response, postData) {
    var reqStr = url.parse(request.url).query;
    var reqData = querystring.parse(reqStr);
    var data = {name: reqData.username, password: reqData.password};
    mongoClient.connect(URL, function (e, db) {
        if (e) {
            console.log(e);
        }
        else {
            var user = db.collection("user");
            user.findOne({name: reqData.username}, function (e, result) {
                if (result == null) {
                    user.insert(data, function (e, result) {
                        if (e) {
                            console.log(e);
                        }
                        else {
                            console.log("add user succeed");
                            response.writeHead(200, {"Content-type": "text/html"});
                            response.write("register succeed" + '</br>' + '<a href="/load">' + "Go back indexPage" + '</a>');
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
    var md5M = (postData);
    collection.insert({name: postData.username}, {sessions: [{md5Message: md5M}, {md5Time: new Date()}]}, function (e, result) {
        if (e) {
            return false;
        }
        else {
            if (result.n == 1) {
                console.log("insert sessions succeed");
                return true;
            }
            else {
                return false;
            }
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
