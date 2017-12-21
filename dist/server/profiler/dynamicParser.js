'use strict';

var Parser = require('./dynamicParser_mock.js');
var parser = new Parser();
var count = 0;
parser.on('data', function (data) {
    count++;
});
parser.on('finish', function () {
    var total = new Date().getTime() - start;
    console.log("time taken: ");
    console.log(total);
    console.log("average frame time: ");
    console.log(total / 100000);
    console.log("average frame rate: ");
    console.log(1000 / (total / 100000));
    if (count < 100000) console.error("count is off :" + count);
});
var can = [0x200, 0x201, 0x488, 0x626, 392, 904];
var array = [0x200, 0, // timestamp
20, 20, 20, 20, 20, 20, 20, 20];
var start = new Date().getTime();
console.log("start time: " + start);
for (var i = 0; i < 100000; i++) {
    array[0] = can[Math.floor(Math.random() * can.length)];
    array[1] = new Date().getTime();
    parser.write(array);
}
parser.end();
//# sourceMappingURL=dynamicParser.js.map
