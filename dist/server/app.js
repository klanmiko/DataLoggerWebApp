/**
 * Main application file
 */

'use strict';

var _setImmediate2 = require('babel-runtime/core-js/set-immediate');

var _setImmediate3 = _interopRequireDefault(_setImmediate2);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _environment = require('./config/environment');

var _environment2 = _interopRequireDefault(_environment);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _log = require('./console/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cluster = require('cluster');
if (cluster.isMaster) {
    // Start server
    var startServer = function startServer() {
        app.angularFullstack = server.listen(_environment2.default.port, _environment2.default.ip, function () {
            console.log('Express server listening on ' + _environment2.default.port + ', in ' + app.get('env') + ' mode');
        });
    };

    if (process.env.NODE_ENV != "test") {
        console.log = _log2.default.log;
        console.error = _log2.default.error;
    }
    // Connect to MongoDB

    // Populate databases with sample data
    // Setup server
    var app = (0, _express2.default)();
    var server = _http2.default.createServer(app);
    var socketio = require('socket.io')(server, {
        serveClient: _environment2.default.env !== 'production',
        path: '/socket.io-client'
    });
    var Serial = require('./serial/serial.js');
    var Parser = require('./serial/dynamicParser.js');
    var dbStream = require('./db/dbStream.js');
    var arduinoListener;
    var parser = new Parser();
    var database = new dbStream();
    var webSource = socketio.of('/src');
    webSource.on('connect', function (socket) {
        console.log("Source connected: ");
        arduinoListener.unpipe(parser);
        arduinoListener.disconnect();
        socket.on('data', function (data) {
            parser.write(data);
        });
    });
    parser.on('data', function (data) {
        switch (data.CAN_Id) {
            case 1574:
            case 512:
            case 513:
                socketio.emit("car", data);
                break;
            case 1160:
                socketio.emit("temp", data);
                break;
            case 392:
            case 904:
                socketio.emit("bms", data);
                break;
            default:
                socketio.emit("data", data);
        }
    });
    require('./config/socketio').default(socketio);
    require('./config/express').default(app);
    require('./routes').default(app, parser, database);

    (0, _setImmediate3.default)(startServer);
    (0, _setImmediate3.default)(function () {
        arduinoListener = new Serial();
        arduinoListener.pipe(parser);
    });
    cluster.fork();
}
var source;
if (!cluster.isMaster) {
    source = require('./serial/serial_test/socket_source.js');
}
// Expose app
exports = module.exports = app;
//# sourceMappingURL=app.js.map
