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
        var self = this;
        this.findArduino(function(err,port){
            self.setPort(port);
        });
        if(!this.reconnect){
            this.reconnect = setInterval(function(){ 
                if(!self.arduinoPort){ 
                    console.log("reconnecting to Arduino Serial"); 
                    self.findArduino(function(err,port){ 
                        self.setPort(port); 
                    }); 
                }  
            },5000);
        } 
    } 
    disconnect(){ 
        if(this.arduinoPort){ 
            this.arduinoPort.close(); 
        } 
        clearInterval(this.reconnect); 
        this.reconnect = undefined;
    }
    findArduino(callback){
        if(this.arduinoPort){
            this.arduinoPort.close();
        }
        SerialPort.list(function (err, ports) {
            if(err){
                console.error.bind(err);
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
            clearInterval(this.reconnect);
            var port = new SerialPort(found.comName, {
                            parser: SerialPort.parsers.byteDelimiter([10])
                        });
            port.on('data',this._data.bind(self));
            port.on("close",this._close.bind(self));
            this.arduinoPort = port;
        }
    }
    _close(){
        console.log("closing");
        this.disconnect();
    }
    _data(data){
        if(data.length==15){
            setImmediate(function(){
                var array = [];
                data = Buffer.from(data,'utf-8').slice(0,data.length-1);
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
