/**
 * Created by lihaiyan on 16/7/19.
 */
var mongoClient=require("mongodb").MongoClient;
mongoClient.connect("mongodb://localhost/",function (err,db) {
    var myDB=db.db("test");
    myDB.collection("nebulae",function (err,nebulae) {
        nebulae.find({type:"planetary"},function (err,items) {
            items.toArray(function (err,itemArr) {
                console.log("Before Update : ");
                console.log(itemArr);
                nebulae.update({type:"planetary"},{$set:{ngc:"NGC 3372",name:"Carina",type:'diffuse',location:"Carina"}},
                    {upsert:true,w:1,forceServerObjectId:false},function (err,result) {
                        nebulae.find({type:"diffuse"},function (err,items) {
                            items.toArray(function (err,itemArr) {
                                console.log("After Update 1 : ");
                                console.log(itemArr);
                                var itemID=itemArr[0]._id;
                                nebulae.update({_id:itemID},{$set:{ngc:"NGC 3372",name:"Carina",type:"Diffuse",location:"Carina"}},
                                    {upsert:true,w:1},function (err,result) {
                                        nebulae.findOne({_id:'itemsID'},function (err,results) {
                                            console.log("After update 2:");
                                            console.log(itemArr);
                                            db.close();
                                        })
                                    });
                            })
                        })
                    })
            })
        })
    })
})
