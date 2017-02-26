export class DeltaBuffer {
  constructor(keys, callback) {
    this.lastPoints = [];
    this.callback = callback;
    this.keys = keys;
    this.delta = 0;
    this.keys.forEach(function (key) {
      this.push({time:NaN, point:NaN});
    }.bind(this.lastPoints));
  }
  stop(){
    if(this.refresh) clearInterval(this.refresh);
    this.buffer.length = 0;
  }
  getKeys() {
    return this.keys;
  }
  begin(){
    this.refresh = setInterval(function(){
      this.publishLast();  
    }.bind(this),1000);
  }
  aggregate(){
    var out = [];
    for (let i = 0; i < this.keys.length; i++) {
      let object = new Object();
      object.Timestamp = this.lastPoints[i].time; 
      object[this.keys[i]] = this.lastPoints[i].point;
      out.push(object);
    }
    return out;
  }
  push(point) {
    var self = this;
    //console.log(point);
    for (let i = 0; i < this.keys.length; i++) {
      if (this.lastPoints[i].point != point[this.keys[i]]) {
        console.log("new point");
        var out = new Object();
        out.Timestamp = point.Timestamp;
        out[this.keys[i]] = point[this.keys[i]];
        out.CAN_Id = point.CAN_Id;
        this.callback(out);
      }
      this.lastPoints[i] = {time: point.Timestamp, CAN_Id: point.CAN_Id, point: point[this.keys[i]]};
    }
  }
  publishLast(){
    for(let i=0; i<this.keys.length; i++){
      var out = new Object();
      out.CAN_Id = this.lastPoints[i].CAN_Id;
      out.Timestamp = this.lastPoints[i].time;
      out[this.keys[i]] = this.lastPoints[i].point;
      this.callback(out);
    }
  }
}

export default DeltaBuffer;
