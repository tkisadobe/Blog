/**
 * Created by ASUS on 2016/7/6.
 */
/**Ԥ������򣬳�ʼ����*/
var md5 = require('md5');
var fs = require('fs');

fs.readFile('lalalala',function(e,buff){
    console.log(md5(buff));
});
