var stream = require('stream');
var Q = require('q');
var Descriptor = require('../api/db/parse_descriptor.js');
var Validator = require('../api/db/validator.js');
class parseStream extends stream.Transform{ //ES6 Javascript is now just Java, apparently
    constructor(options) {
        options = options || {};
        options.objectMode = true;
        super(options);
        Descriptor.onload = this.load.bind(this);
        if(options && options.done)
            this.load.done(function() {
                options.done();
            });
    }
    load() {
        var self = this;
        var start = new Date().getTime();
        Descriptor.model.find({}, function(err, array) {
            if(err) console.error(err);
            self.specification = new Map();
            for(let map of array) {
                self.specification.set(map.CAN_Id, map);
            }
            console.log("db load: " + (new Date().getTime() - start));
        })
    }
    _transform(chunk, encoding, next) {
        var transformed = Q.fcall(this.parse.bind(this), chunk);
        transformed.then(function(value)
        {
            this.push(value);
        }.bind(this)).catch(function(err){
            if(process.env.NODE_ENV=="development"){
                if(err) console.error(err);
                console.error("missing some parser");
            }
        }.bind(this))
        .done();
        next();
    }
    getArray(data,map){
        var out = [];
        for(var i=0;i<map.length;i++){
            out.push(this.getValue(data.slice(),
                {dataType:map.array.subDataType,
                    offset:map.offset+i*map.array.subLength,
                    length:map.array.subLength
                }));
        }
        return out;
    }
    getString(data,map){
        return this.getDecimal(data,map).toString();
    }
    getDecimal(data,map){
        var out = 0;
        var offset = map.offset;
        var length = map.length;
        var preStartIndex = Math.floor(map.offset/8)+2;
        var preShift = map.offset%8;
        for(var i=0;i<preShift;i++){
            data[preStartIndex]&=0x7F;
            data[preStartIndex] = data[preStartIndex]<<1;
        }
        data[preStartIndex] = data[preStartIndex]>>preShift;
        offset -= preShift;
        length += preShift; 
        while(length>0){
            out = out<<1;
            out |= ((data[Math.floor(offset/8)+2]&0x80)>>7);
            data[Math.floor(offset/8)+2] = data[Math.floor(offset/8)+2]<<1;
            offset++;
            length--;
        }
        return out;        
    }
    getFlag(data,map){
        var out = [];
        var value = 0;
        var length = map.length;
        var offset = map.offset;
        while(length>0){
            value = value<<8;
            value |= data[Math.floor(offset/8)+2];
            offset+=8;
            length-=8;
        }
        length = map.length;
        out.push(value==0);
        while(length>0){
            out.push((value&0x01)==0x01);
            value = value>>1;
            length--;
        }
        return out;
    }
    getState(data,map){
        var out=0;
        var length = map.length;
        var offset = map.offset;
        //console.log(map);
        while(length>0){
            out = out<<8;
            out |= data[Math.floor(offset/8)+2];
            offset+=8;
            length-=8;
        }
        return out;
    }
    getValue(data,map){
        switch(map.dataType){
            case "array":
                return this.getArray(data,map);
            case "decimal":
                return this.getDecimal(data,map);
            case "flag":
                return this.getFlag(data,map);
            case "state":
                return this.getState(data,map);
        }
    }
    beginParsing(out,data,spec){
        var self = this;
        spec.map.forEach(function(value,index,array){
            if(value.key){
                out[value.key] = self.getValue(data.slice(),value);
            }
            else{
                if(!out.generics) out.generics = new Array();
                var object = new Object();
                object.description = value.description;
                object.dataType = value.dataType;
                if(value.dataType == 'array') object.subDataType = value.array.subDataType;
                object.value = self.getValue(data.slice(),value);
                out.generics.push(object);
            }
        });
        return out;
    }
    chooseParser(data){
        var self = this;
        var out = new Object();
        out.CAN_Id = data[0];
        out.Timestamp = data[1];
        out.raw = new Array();
        for(var i=2;i<data.length;i++){
            out.raw.push(data[i].toString(16));
        }
        var spec = this.specification || new Map();
        var map = spec.get(data[0]) || {CAN_Id: data[0], map:[]};
        return this.beginParsing(out, data, map);
        //console.log("looking up database");
    }
    parse(data) {
        if(data&&data.length>0){
            var deferred = Q.defer();
            setImmediate(function() {
                deferred.resolve(Q.fcall(this.chooseParser.bind(this), data));
            }.bind(this));
            return deferred.promise;
        }
        else return "";
    }
}
module.exports = parseStream;