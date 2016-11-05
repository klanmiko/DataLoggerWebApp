const SerialPort = require("serialport");
const Readable = require('stream').Readable;
class serialStream extends Readable
{
    constructor(options)
    {
        super(options);
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
        this.reconnect = setInterval(function(){ 
            if(!self.arduinoPort){ 
                console.log("reconnecting to Arduino Serial"); 
                self.findArduino(function(err,port){ 
                    self.setPort(port); 
                }); 
            } 
            else if(!self.arduinoPort.isOpen()){ 
                self.arduinoPort.open(); 
            } 
        },1000); 
    } 
    disconnect(){ 
        if(this.arduinoPort){ 
            this.arduinoPort.close(); 
        } 
    clearInterval(this.reconnect); 
    }
    findArduino(callback){
        SerialPort.list(function (err, ports) {
            ports.forEach(function (port) {
                console.log(port.comName);
                console.log(port.pnpId);
                console.log(port.manufacturer);
                if (port.manufacturer.includes("Arduino"))
                {
                    callback(null,new SerialPort(port.comName, {
                        parser: SerialPort.parsers.readline('\n')
                    }));
                }
            });
        });
    }
    setPort(port){
        var self = this;
        port.on('data',this._data.bind(self));
        port.on("close",this._close.bind(self));
        this.arduinoPort = port;
    }
    _close(){
        this.push(null);
    }
    _data(data){
        if(!this.push(data)){
            console.log("pausing because the read has stopped");
            this.arduinoPort.pause();
        }
    }
}
module.exports = serialStream;