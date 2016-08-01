/**
 * Created by lihaiyan on 16/7/31.
 */
var util = require('util');
function uniq(a) {
    console.log('this is null',util.inspect(a, false, null));
    if(a===0){
        console.log("无分类");
    }
    else {
        return a.sort().filter(function (item, pos, ary) {
            return !pos || item != ary[pos - 1];
        })
    }
}

function log(log_item) {
    console.log('this is null',util.inspect(log_item, false, null));
}
exports.uniq = uniq;
exports.log = log;