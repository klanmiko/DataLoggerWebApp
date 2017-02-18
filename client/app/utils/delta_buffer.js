export class DeltaBuffer {
  constructor(keys, callback) {
    this.lastPoints = [];
    this.callback = callback;
    this.keys = keys;
    this.keys.forEach(function (key) {
      this.push(NaN);
    }.bind(this.lastPoints));
  }

  getKeys() {
    return this.keys;
  }

  push(point) {
    var self = this;
    for (let i = 0; i < this.keys.length; i++) {
      if (this.lastPoints[i] != point[this.keys[i]]) {
        console.log("new point");
        var out = new Object();
        out.Timestamp = point.Timestamp;
        out[this.keys[i]] = point[this.keys[i]];
        out.CAN_Id = point.CAN_Id;
        this.lastPoints[i] = point[this.keys[i]];
        this.callback(out);
      }
    }
  }
}

export default DeltaBuffer;
