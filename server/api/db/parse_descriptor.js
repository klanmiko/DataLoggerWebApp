var Mongoose = require('mongoose');
var Q = require('q');
Mongoose.Promise = require('q').Promise;
var path = require('path');
var local = path.resolve(__dirname);
var fs = require('fs');
var assert = require('assert');
var mongoose = Mongoose.createConnection("mongodb://localhost/data");
var canDescription  = new Mongoose.Schema({
    CAN_Id: {
        type:Number,
        unique:true,
        index:true
    },
    PDO_Description:String,
    map:[{
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
});
var model = mongoose.model('Descriptor',canDescription);
function load(){
    fs.readFile(`${local}/defaults.conf`,function(err,data){
        var defaults = JSON.parse(data);
        model.count({"CAN_Id":1574},function(err,countr){
            if(countr==0){
                if(defaults.can_1574){
                    model.create(defaults.can_1574,function(err,doc){
                        if(err) console.error(err);
                        assert.deepEqual(defaults.can_1574,doc);
                    });
                }
            }
        });
        model.count({"CAN_Id":512},function(err,countr){
            if(countr==0){
                if(defaults.can_512){
                    model.create(defaults.can_512,function(err,doc){
                        if(err) console.error(err);
                    });
                }
            }
        });
        model.count({"CAN_Id":513},function(err,countr){
            if(countr==0){
                if(defaults.can_513){
                    model.create(defaults.can_513,function(err,doc){
                        if(err) console.error(err);
                    });
                }
            }
        });
        model.count({"CAN_Id":1160},function(err,countr){
            if(countr==0){
                if(defaults.can_1160){
                    model.create(defaults.can_1160,function(err,doc){
                        if(err) console.error(err);
                    });
                }
            }
        });
        model.count({"CAN_Id":392},function(err,countr){
            if(countr==0){
                if(defaults.can_392){
                    model.create(defaults.can_392,function(err,doc){
                        if(err) console.error(err);
                    });
                }
            }
        });
        model.count({"CAN_Id":904},function(err,countr){
            if(countr==0){
                if(defaults.can_904){
                    model.create(defaults.can_904,function(err,doc){
                        if(err) console.error(err);
                    });
                }
            }
        });
    });
}
load();
module.exports.model = model;
