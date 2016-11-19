var MongoClient = require('mongodb').MongoClient;
var model = require('./parse_descriptor.js').model;
var Validator = require('./validator.js');
var database;
MongoClient.connect('mongodb://localhost/data',function(err,db){
  if(err){
    console.error(err);
    return;
  }
  database = db;
});
export function list(req,res){
  database.listCollections().toArray(function (err,collections) {
    if(err)console.error(err);
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
export function save(req,res){
  try{
    Validator(req.body);
    model.update({CAN_Id:req.body.CAN_Id},req.body,{upsert:true});
    res.sendStatus(201);
  }
  catch(error){
    console.error(error);
    res.status(400);
  }
}