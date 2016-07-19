/**
 * Created by lihaiyan on 16/7/19.
 */
var monogoClient=require("mongodb").MongoClient;
function addObject(collection,object) {
     collection.insert(object,function (err,result) {
         if(!err){
             console.log("Inserted : ");
             console.log(result);
         }
     });
}
monogoClient.connect("mongodb://localhost/",function (err,db) {
    var myDB=db.db("test");
    myDB.createCollection("nebulae",function (err,nebulae) {
        addObject(nebulae,{ngc:"NGC 7293",name:"Helix",type:"planetary",location:"Aquila"});
        addObject(nebulae,{ngc:"NGC 6543",name:"Cat's eye",type:"planetary",location:"Draco"});
    });

    myDB.collection("nebulae",function (err,nebulae) {
        nebulae.find(function (err,items) {
            items.toArray(function (err,itemArr) {
                console.log("Document Array:");
                console.log(itemArr);
            });
        });
        nebulae.find(function (err,items) {
            items.each(function (err,item) {
                if(item){
                    console.log("Singlular Document: ");
                    console.log(item);
                }
            });
        });
        nebulae.findOne({type:"planetary"},function (err,item) {
            console.log("Found one : ");
            console.log(item);
        });
    });

    setTimeout(function () {
        db.close();
    },3000);
});
