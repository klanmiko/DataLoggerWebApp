var DataStore = require('nedb');
var path = require('path');
var local = path.resolve(__dirname);
var fs = require('fs');
var assert = require('assert');

/*var canDescription  = new Mongoose.Schema({
    CAN_Id: {
        type:Number,
        unique:true,
        index:true
    },
    PDO_Description:String,
    map:[{
        _id:false,
        key:String,
        description:String,
        length:Number, //if datatype is array, refers to number of array elements
        offset:Number,
        dataType:{
            type:String,
            match:/flag|state|decimal|string|array/
        },
        array:{
            subLength:Number,
            subDataType:{
                type:String,
                match:/flag|state|decimal|string/
            }
        }
        }]
});*/
var database = new DataStore({filename: path.resolve(__dirname, "./data/descriptors"), autoload: true});
database.ensureIndex({fieldName: "CAN_Id", unique: true}, (err) => {if(err) console.error(err)});

(function load() {
    fs.readFile(`${local}/defaults.conf`, function(err, data) {
        var defaults = JSON.parse(data);
        console.log(defaults);
        Object.keys(defaults).forEach(function(key) {
            database.count({"CAN_Id": defaults[key].CAN_Id}, function(err, countr){
                if(countr == 0) {
                    if(defaults[key]){
                        database.insert(defaults[key], function(err) {
                            if(err) console.error(err);
                        });
                    }
                }
            })
        });
        setTimeout(module.exports.onload, 1000);
    });
}());
module.exports.model = database;
module.exports.onload = function(){};
module.exports.reset = function(cb) {
    fs.readFile(`${local}/defaults.conf`, function(err, data) {
        if(err) {
            console.error("error reading file");
            cb(err);
            return;
        }
        var defaults = JSON.parse(data);
        let error = null;
        database.remove({}, {multi: true}, function(err) {
            if(err) {
                cb(err);
                return;
            }
            Object.keys(defaults).forEach(function(key) {
                database.insert(defaults[key], function(err) {
                    if(err) {
                        console.error("error saving doc");
                        error = err;
                        return;
                    }
                });
            });
            cb(error); // done
        });
    });
};
