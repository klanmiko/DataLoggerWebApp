var MongoClient = require('mongodb').MongoClient;
var database;
MongoClient.connect('mongodb://localhost/data',function(err,db){
  if(err){
    console.error(err);
    return;
  }
  database = db;
});
export function list(req,res){
  console.log("list");
  database.listCollections().toArray(function (err,collections) {
    console.log("inside");
    if(err)console.error(err);
    console.log(collections);
    console.log(res);
    res.status(200).send(collections);
  });
}
export function printData(req,res){
  var name = req.params.collection;
  var collection = database.collection(name);
  collection.find().toArray(function(err,elements)
  {
    if(err){
      console.error(err);
      res.status(404);
    }
    res.status(200).send(elements);
  });
}
