var dbStream = require('../../db/dbStream.js');
class Controller{
    constructor(db,parser){
        this.db = db;
        this.parser = parser;
        this.cache = new Map();
        this.hookParser(this.parser);
    }
    getActive() {
        return this.collection;
    }
    hookParser(parser){
        this.cache.clear();
        parser.on('data',function(data){
            this.cache.set(data.CAN_Id, data);
        }.bind(this));
    }
    start(req,res){
        if(!this.parser.isPaused()){
            res.sendStatus(401);
            return;
        } 
        var database = new dbStream();
        this.parser.load();
        this.parser.resume();
        this.hookParser(this.parser);
        database.ready(function(){
            res.status(200).send("demo");
        }.bind(this));
        this.db = database;
    }
    stop(req, res) {
        this.parser.unpipe();
        this.parser.pause();
        this.parser.specification = null;
        this.db.save();
        this.cache.clear();
        res.status(200).send("Stopped");
    }
    current(req,res){
        if(this.parser.isPaused()) res.status(200).send("Stopped");
        else if(this.db&&this.db.collection&&this.db.collection.collectionName) res.status(200).send(this.db.collection.collectionName);
        else{
            res.send("demo")
        }
    }
    last(req,res){
        if(!req.query.CAN_Id){
            res.sendStatus(404);
            return;
        }
        req.query.CAN_Id = parseInt(req.query.CAN_Id);
        if(!this.cache.has(req.query.CAN_Id)) res.sendStatus(404);
        else{
            res.send(this.cache.get(req.query.CAN_Id));
        }
    }
}
module.exports = Controller;