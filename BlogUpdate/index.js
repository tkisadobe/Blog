/**
 * Created by lihaiyan on 16/7/15.
 */
var server=require('./server');
var router=require('./router');
var requestHandler=require('./requestHandler');

var handle={};
handle["/"]=requestHandler.load;
handle["/load"]=requestHandler.load;
handle["/uploadPicture"]=requestHandler.uploadPicture;
handle["/showPicture"]=requestHandler.showPicture;
handle["/homePage"]=requestHandler.homePage;
handle["/showHomePage"]=requestHandler.showHomePage;
handle["/writeBlog"]=requestHandler.writeBlog;
handle["/login"]=requestHandler.login;
handle["/loginJudge"]=requestHandler.loginJudge;
handle["/adminLogin"]=requestHandler.adminLogin;
handle["/adminLoginJudge"]=requestHandler.adminLoginJudge;
handle["/showAdminHomePage"]=requestHandler.showAdminHomePage;
handle["/findUserInfo"]=requestHandler.findUserInfo;
handle["/updateUserInfo"]=requestHandler.updateUserInfo;
handle["/register"]=requestHandler.register;
handle["/findBlog"]=requestHandler.findBlog;
handle["/insertPage"]=requestHandler.insertPage;
handle["/removePage"]=requestHandler.removePage;
handle["/insertUser"]=requestHandler.insertUser;
handle["/updatePage"]=requestHandler.updatePage;
handle["/selectBlog"]=requestHandler.selectBlog;
handle["/selectOneBlog"]=requestHandler.selectOneBlog;
handle["/classification"]=requestHandler.classification;
handle["/indexFindBlog"]=requestHandler.indexFindBlog;
server.start(router.route,handle);