export class DeltaBuffer {
  constructor(keys, callback) {
    this.lastPoints = [];
    this.callback = callback;
    this.keys = keys;
    this.delta = 0;
    this.keys.forEach(function (key) {
      this.push(NaN);
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
  push(point) {
    var self = this;
    for (let i = 0; i < this.keys.length; i++) {
      if(point[this.keys[i]] instanceof Array)//handle flags
      {
        for(let j = 0; j < point[this.keys[i]].length; j++) {
          var currFlag = point[this.keys[i]][j];
          var diffData = false;
          if (!this.lastPoints[i] || currFlag != this.lastPoints[i].point[j])
          {
            diffData = true;
            break;
          }
        }
        if (diffData) {
          var out = new Object();
          out.Timestamp = point.Timestamp;
          out[this.keys[i]] = point[this.keys[i]];
          out.CAN_Id = point.CAN_Id;
          this.callback(out);
        }
      }
      else {
        if (this.lastPoints[i].point != point[this.keys[i]]) {
          console.log("new point");
          var out = new Object();
          out.Timestamp = point.Timestamp;
          out[this.keys[i]] = point[this.keys[i]];
          out.CAN_Id = point.CAN_Id;
          this.callback(out);
        }
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
