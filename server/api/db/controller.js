var MongoClient = require('mongodb').MongoClient;
export function list(res,req){
  MongoClient.connect('mongodb://localhost/data',function(err,db){
    db.listCollections(function (err,collections) {
      if(err)console.bind(console,"error getting collections")
      res.send(collections);
    });
  });
}
export function printData(res,req){
  var name = req.collectionName;
  MongoClient.connect('mongodb://localhost/data',function(err,db){
    db.collection(name, {strict:true}, function(err, collection) {
      collection.find().toArray(function(err,elements)
      {
        res.send(elements);
      });
    });
  });
}
