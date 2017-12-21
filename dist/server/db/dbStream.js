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

var Writable = require('stream').Writable;
var EventEmitter = require('events');

var dbStream = function (_Writable) {
    (0, _inherits3.default)(dbStream, _Writable);

    function dbStream(options) {
        (0, _classCallCheck3.default)(this, dbStream);

        options = options || {};

        var _this = (0, _possibleConstructorReturn3.default)(this, (dbStream.__proto__ || (0, _getPrototypeOf2.default)(dbStream)).call(this, options));

        _this.emitter = new EventEmitter();
        _this.emitter.emit("ready");
        return _this;
    }

    (0, _createClass3.default)(dbStream, [{
        key: '_write',
        value: function _write(chunk, encoding, callback) {
            callback();
        }
    }, {
        key: 'ready',
        value: function ready(callback) {
            this.emitter.on("ready", callback);
        }
    }, {
        key: 'save',
        value: function save() {}
    }]);
    return dbStream;
}(Writable);

module.exports = dbStream;
//# sourceMappingURL=dbStream.js.map