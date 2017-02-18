export class AverageBuffer {
  constructor(ms, keys, callback) {
    this.ms = ms;
    this.buffer = [];
    this.callback = callback;
    this.keys = keys;
  }
  getKeys() {
    return this.keys;
  }
  push(point) {
    var self = this;
    if (point instanceof Object) {
      if (!this.start) {
        this.start = point.Timestamp;
      }
      if (point.Timestamp - this.start < this.ms) {
        this.buffer.push(point);
      }
      else {
        var out = new Object();
        let seconds = Math.floor(this.start / (1000) % 60);
        let minutes = Math.floor(this.start / (1000 * 60) % 60);
        out.Timestamp = `${minutes}.${seconds}`;
        out.CAN_Id = this.buffer[0].CAN_Id;
        this.keys.forEach(function (key) {
          if (self.buffer[0][key] instanceof Array) {
            var sums = [];
            for (var i = 0; i < self.buffer[0][key].length; i++) {
              sums.push(0);
              self.buffer.forEach(function (value) {
                if (value[key]) sums[i] += value[key][i];
              });
            }
            for (var i = 0; i < sums.length; i++) {
              sums[i] = sums[i] / self.buffer.length;
            }
            out[key] = sums;
          }
          else {
            out[key] = 0;
            self.buffer.forEach(function (value) {
              if (value[key]) out[key] += value[key];
            });
            if (self.buffer.length > 0) out[key] /= self.buffer.length;
          }
        });
        this.start = undefined;
        this.buffer = [];
        this.callback(out);
      }
    }
  }
}



export default AverageBuffer;
