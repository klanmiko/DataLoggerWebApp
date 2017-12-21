'use strict';

var _setImmediate2 = require('babel-runtime/core-js/set-immediate');

var _setImmediate3 = _interopRequireDefault(_setImmediate2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SerialPort = require("serialport");
var Readable = require('stream').Readable;
var logger = require('../console/log.js');

var serialStream = function (_Readable) {
    (0, _inherits3.default)(serialStream, _Readable);

    function serialStream(options) {
        (0, _classCallCheck3.default)(this, serialStream);

        options = options || {};
        options.objectMode = true;

        var _this = (0, _possibleConstructorReturn3.default)(this, (serialStream.__proto__ || (0, _getPrototypeOf2.default)(serialStream)).call(this, options));

        _this.connect();
        return _this;
    }

    (0, _createClass3.default)(serialStream, [{
        key: '_read',
        value: function _read() {
            if (this.arduinoPort && this.arduinoPort.resume) this.arduinoPort.resume();
        }
    }, {
        key: 'connect',
        value: function connect() {
            console.log("connect called");
            var self = this;
            this.findArduino(function (err, port) {
                if (err) console.error(err);
                if (port) self.setPort(port);
            });
            if (!self.reconnect) {
                self.reconnect = setInterval(function () {
                    if (!self.arduinoPort) {
                        //console.log("reconnecting to Arduino Serial"); 
                        self.findArduino(function (err, port) {
                            if (err) console.error(err);
                            if (port) self.setPort(port);
                        });
                    }
                }, 5000);
            }
        }
    }, {
        key: 'disconnect',
        value: function disconnect() {
            if (this.arduinoPort) {
                this.arduinoPort.removeListener("close", this._closePort);
                this.arduinoPort.close();
            }
            clearInterval(this.reconnect);
            this.reconnect = undefined;
        }
    }, {
        key: 'findArduino',
        value: function findArduino(callback) {
            SerialPort.list(function (err, ports) {
                if (err) {
                    console.error(err);
                    console.log("error in listing ports");
                    callback(err, null);
                }
                ports.forEach(function (port) {
                    if (port.manufacturer && port.manufacturer.includes("Arduino")) {
                        callback(null, port);
                    }
                });
            });
        }
    }, {
        key: 'setPort',
        value: function setPort(found) {
            var self = this;
            if (!(this.arduinoPort && this.arduinoPort.path == found.comName)) {
                try {
                    console.log(found.comName);
                    console.log(found.pnpId);
                    console.log(found.manufacturer);
                    var port = new SerialPort(found.comName, {
                        parser: SerialPort.parsers.byteDelimiter([0xFF, 10])
                    });
                    port.on('data', this._data.bind(self));
                    port.on("close", this._closePort.bind(self));
                    this.arduinoPort = port;
                } catch (e) {
                    console.log("error attaching to port");
                    console.error(e);
                }
            }
        }
    }, {
        key: '_closePort',
        value: function _closePort() {
            console.log("closing");
            this.arduinoPort = undefined;
        }
    }, {
        key: '_data',
        value: function _data(data) {
            if (data.length == 16) {
                (0, _setImmediate3.default)(function () {
                    var array = [];
                    data = Buffer.from(data, 'utf-8').slice(0, data.length - 2);
                    array.push(data.readUInt16BE(0));
                    array.push(data.readUInt32BE(2));
                    for (var i = 6; i < data.length; i++) {
                        array.push(data.readUInt8(i));
                    }
                    this.push(array);
                }.bind(this));
            }
        }
    }]);
    return serialStream;
}(Readable);

module.exports = serialStream;
//# sourceMappingURL=serial.js.map
