'use strict';

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

var stream = require('stream');

var LogStream = function (_stream$Writable) {
    (0, _inherits3.default)(LogStream, _stream$Writable);

    function LogStream(options) {
        (0, _classCallCheck3.default)(this, LogStream);
        return (0, _possibleConstructorReturn3.default)(this, (LogStream.__proto__ || (0, _getPrototypeOf2.default)(LogStream)).call(this, options));
    }

    (0, _createClass3.default)(LogStream, [{
        key: '_write',
        value: function _write(chunk, encoding, next) {
            next();
        }
    }]);
    return LogStream;
}(stream.Writable);

module.exports.logStream = new LogStream({ decodeStrings: true });
module.exports.set = function () {};
module.exports.error = function () {};
//# sourceMappingURL=emptyLogger.js.map
