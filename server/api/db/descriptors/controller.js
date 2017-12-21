const ParseDescriptor = require('../parse_descriptor.js');
var model = ParseDescriptor.model;
var Validator = require('../validator.js');

export function listDescriptor(req, res) {
    model.find({}, {_id: 0}, function(err, result) {
        if(err) {
            console.error(err);
            res.sendStatus(401);
            return;
        }
        res.send(result);
    });
}
export function getDescriptor(req, res) {
    model.findOne({CAN_Id: Number(req.params.descriptor)}, {_id: 0, "map.key": 0}, function(err, result) {
        if(err) {
            console.error(err);
            res.sendStatus(401);
            return;
        }
        res.send(result);
    });
}
export function updateDescriptor(req, res) {
    if(!req.body) {
        res.sendStatus(401);
        return;
    }
    var request = req.body;
    try {
        Validator(request);
        var set = new Object();
        var unset = new Object();
        set.CAN_Id = request.CAN_Id;
        set.PDO_Description = request.PDO_Description;
        var count;
        model.findOne({CAN_Id: Number(req.params.descriptor)})
        .exec(function(err, document) {
            if(document) {
                count = document.map.length;
                if(document.map.length > request.map.length) throw new Error("too few fields");
                for(var i = 0; i < count; i++) {
                    Object.keys(request.map[i]).forEach(function(key) {
                        if(key != 'key') set[`map.${i}.${key}`] = request.map[i][key];
                    });
                    if(request.map[i].dataType != "array") unset[`map.${i}.array`] = "";
                }
                console.log("set");
                console.log(set);
                var add = request.map.slice(count, request.map.length);
                console.log("add");
                console.log(add);
                model.update({CAN_Id: Number(req.params.descriptor)}, {$set: set, $unset: unset}, {upsert: false, multi: false}, function(err, doc) {
                    if(err) {
                        console.error(err);
                        res.status(501).send("invalid update procedure");
                        return;
                    }
                    model.update({CAN_Id: Number(req.params.descriptor)}, {$addToSet: {map: {$each: add}}}, {upsert: true, multi: false, returnUpdatedDocs: true}, function(err, num, doc) {
                        if(err) {
                            console.error(err);
                            res.status(501).send("invalid update procedure");
                            return;
                        }
                        console.log(doc)
                        res.status(200).send(doc);
                    });
                });
            }
            else{
                model.insert(request, function(err) {
                    if(err) {
                        console.log("error creating documents");
                        console.error(err);
                        return;
                    }
                    res.sendStatus(200);
                });
            }
        });
    }
    catch(e){
        console.log(e);
        res.status(402).send("invalid formatting");
    }
}
export function deleteMap(req,res){
    if(req.query.offset && req.query.length && req.query.description && req.query.dataType) {
        console.log(req.query);
        var element = {offset: parseInt(req.query.offset),
            description:req.query.description,
            length: parseInt(req.query.length),
            dataType: req.query.dataType,
            key: {$exists: false}
        };
        console.log(element);
        model.find({CAN_Id: Number(req.params.descriptor), map: {$elemMatch: element}}, {map: 1, _id: 0})
        .exec(function(err, doc) {
            //console.log("we're here");
            if(err) console.error(err);
            if(doc && doc.length > 0) {
                delete element.key;
                model.update({CAN_Id: Number(req.params.descriptor)}, {$pull: {map: element}}, {multi: false,upsert: false,returnUpdatedDocs:true}, function(err, num, doc) {
                    if(err){
                        console.error(err);
                        res.status(501).send("invalid update procedure");
                        return;
                    }
                    res.status(200).send(doc);
                });
            }
            else {
                res.status(401).send("can't delete core mapping");
            }
        });
        /**/
    }
    else {
        model.find({CAN_Id: Number(req.params.descriptor), "map.key": {$exists: true}}).exec(function(err, doc) {
            if(err){
                console.error(err);
                return res.status(501).send("invalid delete procedure");
            }
            console.log(doc);
            if(!doc || (doc instanceof Array && doc.length == 0)) {
                model.remove({CAN_Id: Number(req.params.descriptor)}, function(err) {
                    if(err) {
                        console.log(err);
                        res.status(501).send("invalid delete procedure");
                        return;
                    }
                    res.sendStatus(200);
                });
            }
            else {
                res.status(401).send("can't delete core mapping");
            }
        });
    }
}
export function reset(req, res) {
    ParseDescriptor.reset(err => {
        if(err) {
            console.error(err);
            res.sendStatus(401);
            return;
        }
        res.sendStatus(200);
    });
}
