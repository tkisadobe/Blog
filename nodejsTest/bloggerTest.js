/**
 * Created by ASUS on 2016/7/5.
 */
var requestHandler = require('./requestHandler');
var server = require('./server');
var router = require('./router');

var handle = {}
handle["/"] = requestHandler.load;
handle["/load"] = requestHandler.load;
handle["/insertArticle"] = requestHandler.insertArticle;
handle["/findBlogger"] = requestHandler.findBlogger;
handle["/remove"] = requestHandler.remove;
handle["/insertUser"] = requestHandler.insertUser;
handle["/checkUser"] = requestHandler.checkUser;
handle["/register"] = requestHandler.register;
handle["/login"] = requestHandler.login;
handle["/newBlogger"] = requestHandler.newBlogger;
handle["/loginResult"] = requestHandler.loginResult;


server.start(router.route,handle);