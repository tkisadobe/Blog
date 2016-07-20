/**
 * Created by lihaiyan on 16/7/19.
 */
var express=require("express");
var app=express();
app.use("/",express.static('./static')).
    use('./image',express.static('../images')).
    use('./lib',express.static('./lib'));
app.listen(8000);
