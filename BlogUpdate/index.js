/**
 * Created by lihaiyan on 16/7/15.
 */
var server=require('./server');
var router=require('./router');
var requestHandler=require('./requestHandler');

var handle={}
handle["/"]=requestHandler.load;
handle["/load"]=requestHandler.load;
handle["/writeBlog"]=requestHandler.writeBlog;
handle["/login"]=requestHandler.login;
handle["/loginJudge"]=requestHandler.loginJudge;
handle["/register"]=requestHandler.register;
handle["/findBlog"]=requestHandler.findBlog;
handle["/insertPage"]=requestHandler.insertPage;
handle["/removePage"]=requestHandler.removePage;
handle["/insertUser"]=requestHandler.insertUser;
server.start(router.route,handle);