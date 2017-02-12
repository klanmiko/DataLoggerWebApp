const SerialPort = require("serialport");
const Readable = require('stream').Readable;
class serialStream extends Readable
{
    constructor(options)
    {
        super(options);
        this.connect();
    }
    _read()
    {
        if(this.arduinoPort && this.arduinoPort.resume)this.arduinoPort.resume();
    }
    connect(){
        console.log("connect called");
        var self = this;
        this.findArduino(function(err,port){
            if(err) console.error(err);
            if(port)self.setPort(port);
        });
        if(!self.reconnect){
            self.reconnect = setInterval(function(){ 
                if(!self.arduinoPort){ 
                    //console.log("reconnecting to Arduino Serial"); 
                    self.findArduino(function(err,port){
                        if(err) console.err(err); 
                        if(port)self.setPort(port); 
                    }); 
                }  
            },5000);
        } 
    } 
    disconnect(){ 
        if(this.arduinoPort){
            this.arduinoPort.removeListener("close",this._closePort); 
            this.arduinoPort.close(); 
        } 
        clearInterval(this.reconnect); 
        this.reconnect = undefined;
    }
    findArduino(callback){
        SerialPort.list(function (err, ports) {
            if(err){
                console.error(err);
                console.log("error in listing ports");
                callback(err,null);
            }
            ports.forEach(function (port) {
                console.log(port.comName);
                console.log(port.pnpId);
                console.log(port.manufacturer);
                if (port.manufacturer&&port.manufacturer.includes("Arduino"))
                {
                    callback(null,port);
                }
            });
        });
    }
    setPort(found){
        var self = this;
        if(!(this.arduinoPort&&this.arduinoPort.path==found.comName)){
            try{
                var port = new SerialPort(found.comName, {
                    parser: SerialPort.parsers.byteDelimiter([0xFF,10])
                });
                port.on('data',this._data.bind(self));
                port.on("close",this._closePort.bind(self));
                this.arduinoPort = port;
            }
            catch(e){
                console.log("error attaching to port");
                console.error(e);
            }
        }
    }
    _closePort(){
        console.log("closing");
        this.arduinoPort = undefined;
    }
    _data(data){
        if(data.length==16){
            setImmediate(function(){
                var array = [];
                data = Buffer.from(data,'utf-8').slice(0,data.length-2);
                array.push(data.readUInt16BE(0));
                array.push(data.readUInt32BE(2));
                for(var i=6;i<data.length;i++){
                    array.push(data.readUInt8(i));
                }
                if(!this.push(JSON.stringify(array))){
                    //console.log("pausing because the read has stopped");
                }
            }.bind(this));
        }
    }
}
module.exports = serialStream;
