const Writable = require('stream').Writable;
var EventEmitter = require('events');
class dbStream extends Writable {
    constructor(options) {
        options = options || {};
        super(options);
    }
    _write(chunk, encoding, callback)
    {
        callback();
    }
    ready(callback){
        callback();
    }
    save(){
    }
}
module.exports = dbStream;