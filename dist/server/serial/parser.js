"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stream = require('stream');
function parseDashStatus(out, data) {
    out.state = data[2];
}
function parsePackStatus(out, data) {
    out.carName = data[2];
    out.SOC = data[3];
    var flag = data[4] << 8 | data[5];
    out.flag = [];
    out.flag.push((flag & 0x0000) == 0x0000);
    out.flag.push((flag & 0x0001) == 0x0001);
    out.flag.push((flag & 0x0002) == 0x0002);
    out.flag.push((flag & 0x0004) == 0x0004);
    out.flag.push((flag & 0x0008) == 0x0008);
    out.flag.push((flag & 0x0010) == 0x0010);
    out.flag.push((flag & 0x0020) == 0x0020);
    out.flag.push((flag & 0x0040) == 0x0040);
    out.flag.push((flag & 0x0080) == 0x0080);
    out.flag.push((flag & 0x0100) == 0x0100);
    out.flag.push((flag & 0x0200) == 0x0200);
    out.flag.push((flag & 0x0400) == 0x0400);
    out.flag.push((flag & 0x0800) == 0x0800);
    out.flag.push((flag & 0x1000) == 0x1000);
    out.flag.push((flag & 0x1000) == 0x2000);
    out.flag.push((flag & 0x1000) == 0x4000);
    out.flag.push((flag & 0x1000) == 0x8000);
}
function parseVoltageData(out, data) {
    out.min_voltage = data[2] << 8 | data[3];
    out.max_voltage = data[4] << 8 | data[5];
    out.pack_voltage = data[6] << 24 | data[7] << 16 | data[8] << 8 | data[9];
}
function parseTemperature(out, data) {
    out.temp_array = [];
    for (var i = 2; i < data.length - 2; i++) {
        out.temp_array.push(data[i]);
    }
    out.highest = data[8];
    out.pack_max_temp = data[9];
}
function parseThrottle(out, data) {
    out.difference_check = data[2];
    out.throttle = (data[3] & 0x7F) << 8 | data[4];
    var flag = data[6] << 24 | data[7] << 16 | data[8] << 8 | data[9];
    out.flag = [];
    out.flag.push((flag & 0x0000) == 0x0000);
    out.flag.push((flag & 0x0001) == 0x0001);
    out.flag.push((flag & 0x0002) == 0x0002);
    out.flag.push((flag & 0x0004) == 0x0004);
    out.flag.push((flag & 0x0008) == 0x0008);
    out.flag.push((flag & 0x0010) == 0x0010);
    out.flag.push((flag & 0x0020) == 0x0020);
    out.flag.push((flag & 0x0040) == 0x0040);
}
function parseBrake(out, data) {
    out.difference_check = data[2];
    out.brake = (data[3] & 0x7F) << 8 | data[4];
    var flag = data[6] << 24 | data[7] << 16 | data[8] << 8 | data[9];
    out.flag = [];
    out.flag.push(flag & 0x0000 == 0x0000);
    out.flag.push(flag & 0x0001 == 0x0001);
    out.flag.push(flag & 0x0002 == 0x0002);
    out.flag.push(flag & 0x0004 == 0x0004);
    out.flag.push(flag & 0x0008 == 0x0008);
    out.flag.push(flag & 0x0010 == 0x0010);
    out.flag.push(flag & 0x0020 == 0x0020);
    out.flag.push(flag & 0x0040 == 0x0040);
}
function chooseParser(out, data) {
    switch (data[0]) {
        case 1574:
            parseDashStatus(out, data);
            break;
        case 513:
            parseBrake(out, data);
            break;
        case 512:
            parseThrottle(out, data);
            break;
        case 1160:
            parseTemperature(out, data);
            break;
        case 392:
            parsePackStatus(out, data);
            break;
        case 904:
            parseVoltageData(out, data);
            break;
    }
}

var parseStream = function (_stream$Transform) {
    (0, _inherits3.default)(parseStream, _stream$Transform);

    //ES6 Javascript is now just Java, apparently
    function parseStream(options) {
        (0, _classCallCheck3.default)(this, parseStream);

        options = options || {};
        options.objectMode = true;
        return (0, _possibleConstructorReturn3.default)(this, (parseStream.__proto__ || (0, _getPrototypeOf2.default)(parseStream)).call(this, options));
    }

    (0, _createClass3.default)(parseStream, [{
        key: "_transform",
        value: function _transform(chunk, encoding, next) {
            var transformed = this.parse(chunk);
            this.push(transformed);
            next();
        }
    }, {
        key: "parse",
        value: function parse(data) {
            if (data && data.length > 0) {
                var out = new Object();
                var array = data;
                out.CAN_Id = array[0];
                out.Timestamp = array[1];
                chooseParser(out, array);
                return out;
            } else return "";
        }
    }]);
    return parseStream;
}(stream.Transform);

module.exports = parseStream;
//# sourceMappingURL=parser.js.map
