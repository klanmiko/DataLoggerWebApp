const io = require('socket.io-client');
console.log("starting our mock source")
var config = require('../../config/environment/index.js');
var socket = io(`http://localhost:${config.port}/src`, {
    path:"/socket.io-client"
});
var can = [
    0x200,
    0x201,
    1574,
    392,
    1160,
    904
];
var array = [
    200,
    0, // timestamp
    20,
    20,
    20,
    20,
    20,
    20,
    20,
    20
];
var x = 0;
setInterval(function() {
    array[0] = can[Math.floor(Math.random() * can.length)];
    array[1] = new Date().getTime();
    array[2] = x++;
    array[3] = x++;
    array[4] = x++;
    array[5] = x++;
    array[6] = x++;
    array[7] = x++;
    array[8] = x++;
    array[9] = x++;
    if(x > 80) x %= 80;
    socket.emit('data', array);
}, 100);
