/**
 * Created by ASUS on 2016/7/6.
 */
/**预处理程序，初始化表*/
var md5 = require('md5');
var fs = require('fs');

fs.readFile('lalalala',function(e,buff){
    console.log(md5(buff));
});
