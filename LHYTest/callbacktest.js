/**
 * Created by lihaiyan on 16/7/18.
 */
var events=require("events");
function carShow() {
    events.EventEmitter.call(this);
    this.seeCar=function (make) {
        this.emit("sawCar",make);
    };
}
carShow.prototype.__proto__=events.EventEmitter.prototype;
var show=new carShow();
function logCar(make) {
    console.log("Saw a "+make);
}

function logColorCar(make,color) {
    console.log("Saw a %s %s ",color,make);
}

show.on("sawCar",logCar);
show.on("sarCar",function (make) {
    var colors=["red","blue","black"];
    var color=colors[Math.floor(Math.random()*3)];
    logColorCar(make,color);
});

show.seeCar("laalalla");
show.seeCar("beeeeeee");
show.seeCar("cacaacac");
show.seeCar("dadadada");
show.seeCar("ffffffff");
