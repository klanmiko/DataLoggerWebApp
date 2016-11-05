var stream = require('stream');
var Q = require('q');
var Descriptor = require('../api/db/parse_descriptor.js');
var Validator = require('../api/db/validator.js');
class parseStream extends stream.Transform{ //ES6 Javascript is now just Java, apparently
    constructor(options){
        super(options);
        var self = this;
        this.load = Descriptor.model.find().exec().then(function(array){
            self.specification = array;
        });
        if(options&&options.done)
            this.load.done(function(){
                options.done();
            });
    }
    _transform(chunk, encoding, next) {
        var transformed = Q.fcall(this.parse.bind(this),chunk);
        transformed.then(function(value)
        {
            //console.log(value);
            this.push(JSON.stringify(value)+'\n');
        }.bind(this)).done();
        next();
    }
    getArray(data,map){
        var out = [];
        for(var i=Math.floor(map.offset/8)+2;i<data.length;i+=map.array.subLength/8){
            out.push(this.getValue(data.slice(),
                {dataType:map.array.subDataType,
                    offset:(i-2)*8,
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
            value |= data[Math.floor(map.offset/8)+2];
            offset+=8;
            length-=8;
        }
        length = map.length;
        out.push(value==0x00);
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
        if(this.load.status=='pending'){
            console.log("waiting");
            this.load.done();
        }
        if(this.specification){
            for(var i=0;i<this.specification.length;i++)
            {
                if(data[0]==this.specification[i].CAN_Id) {
                    return self.beginParsing(out,data,this.specification[i]);
                }
            }
            throw new Error("Can not found");
        }
        if(!this.specification){
            console.log("not loaded yet");
        }
        return Descriptor.model.findOne({CAN_Id:data[0]}).exec().then(function(doc){
        //TODO run validation
            try{
                Validator(doc);
                if(self.specification){
                    self.specification.push(doc);
                }
                return self.beginParsing(out,data,doc);
            }
            catch(e){
                throw new Error(e);
            }
        }).catch(function(){
            throw new Error("something went horribly wrong");
        });
    }
    parse(data){
        if(data&&data.length>0){
            var deferred = Q.defer();
            setImmediate(function(){
                data = JSON.parse(data);
                if(!data)return "";
                var array = [];
                if(data instanceof Object)
                {
                    for(var i=0;i<Object.keys(data).length;i++)
                    {
                        array.push(data[Object.keys(data)[i]]);
                    }
                }
                else array = data;
                //console.log(array); 
                deferred.resolve(Q.fcall(this.chooseParser.bind(this),array));
            }.bind(this));
            return deferred.promise;
        }
        else return "";
    }
}
module.exports = parseStream;