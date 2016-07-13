/**
 * Created by lihaiyan on 16/7/8.
 */

var mongo = require("mongodb");
var host = "localhost";
var port = 27017;
var server = new mongo.Server(host, port, {auto_reconnect: true});//创建数据库所在的服务器服务器
var db = new mongo.Db("node-mongo-examples", server, {safe: true});//创建数据库对象
db.open(function (err, db) {//连接数据库
    if (err)
        throw err;
    else {
        console.log("成功建立数据库连接");
        db.close();
    }
});
db.on("close", function (err, db) {//关闭数据库
    if (err) throw err;
    else console.log("成功关闭数据库.");
});