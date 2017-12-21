'use strict';

var _setImmediate2 = require('babel-runtime/core-js/set-immediate');

var _setImmediate3 = _interopRequireDefault(_setImmediate2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

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
var Q = require('q');
var Descriptor = require('../api/db/parse_descriptor.js');
var Validator = require('../api/db/validator.js');

var parseStream = function (_stream$Transform) {
    (0, _inherits3.default)(parseStream, _stream$Transform);

    //ES6 Javascript is now just Java, apparently
    function parseStream(options) {
        (0, _classCallCheck3.default)(this, parseStream);

        options = options || {};
        options.objectMode = true;

        var _this = (0, _possibleConstructorReturn3.default)(this, (parseStream.__proto__ || (0, _getPrototypeOf2.default)(parseStream)).call(this, options));

        var self = _this;
        var start = new Date().getTime();
        Descriptor.onload = function () {
            Descriptor.model.find({}, function (err, array) {
                if (err) console.error(err);
                self.specification = new _map2.default();
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = (0, _getIterator3.default)(array), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var map = _step.value;

                        self.specification.set(map.CAN_Id, map);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                console.log("db load: " + (new Date().getTime() - start));
            });
        };
        if (options && options.done) _this.load.done(function () {
            options.done();
        });
        return _this;
    }

    (0, _createClass3.default)(parseStream, [{
        key: '_transform',
        value: function _transform(chunk, encoding, next) {
            var transformed = Q.fcall(this.parse.bind(this), chunk);
            transformed.then(function (value) {
                this.push(value);
            }.bind(this)).catch(function (err) {
                if (process.env.NODE_ENV == "development") {
                    if (err) console.error(err);
                    console.error("missing some parser");
                }
            }.bind(this)).done();
            next();
        }
    }, {
        key: 'getArray',
        value: function getArray(data, map) {
            var out = [];
            for (var i = 0; i < map.length; i++) {
                out.push(this.getValue(data.slice(), { dataType: map.array.subDataType,
                    offset: map.offset + i * map.array.subLength,
                    length: map.array.subLength
                }));
            }
            return out;
        }
    }, {
        key: 'getString',
        value: function getString(data, map) {
            return this.getDecimal(data, map).toString();
        }
    }, {
        key: 'getDecimal',
        value: function getDecimal(data, map) {
            var out = 0;
            var offset = map.offset;
            var length = map.length;
            var preStartIndex = Math.floor(map.offset / 8) + 2;
            var preShift = map.offset % 8;
            for (var i = 0; i < preShift; i++) {
                data[preStartIndex] &= 0x7F;
                data[preStartIndex] = data[preStartIndex] << 1;
            }
            data[preStartIndex] = data[preStartIndex] >> preShift;
            offset -= preShift;
            length += preShift;
            while (length > 0) {
                out = out << 1;
                out |= (data[Math.floor(offset / 8) + 2] & 0x80) >> 7;
                data[Math.floor(offset / 8) + 2] = data[Math.floor(offset / 8) + 2] << 1;
                offset++;
                length--;
            }
            return out;
        }
    }, {
        key: 'getFlag',
        value: function getFlag(data, map) {
            var out = [];
            var value = 0;
            var length = map.length;
            var offset = map.offset;
            while (length > 0) {
                value = value << 8;
                value |= data[Math.floor(offset / 8) + 2];
                offset += 8;
                length -= 8;
            }
            length = map.length;
            out.push(value == 0);
            while (length > 0) {
                out.push((value & 0x01) == 0x01);
                value = value >> 1;
                length--;
            }
            return out;
        }
    }, {
        key: 'getState',
        value: function getState(data, map) {
            var out = 0;
            var length = map.length;
            var offset = map.offset;
            //console.log(map);
            while (length > 0) {
                out = out << 8;
                out |= data[Math.floor(offset / 8) + 2];
                offset += 8;
                length -= 8;
            }
            return out;
        }
    }, {
        key: 'getValue',
        value: function getValue(data, map) {
            switch (map.dataType) {
                case "array":
                    return this.getArray(data, map);
                case "decimal":
                    return this.getDecimal(data, map);
                case "flag":
                    return this.getFlag(data, map);
                case "state":
                    return this.getState(data, map);
            }
        }
    }, {
        key: 'beginParsing',
        value: function beginParsing(out, data, spec) {
            var self = this;
            spec.map.forEach(function (value, index, array) {
                if (value.key) {
                    out[value.key] = self.getValue(data.slice(), value);
                } else {
                    if (!out.generics) out.generics = new Array();
                    var object = new Object();
                    object.description = value.description;
                    object.dataType = value.dataType;
                    if (value.dataType == 'array') object.subDataType = value.array.subDataType;
                    object.value = self.getValue(data.slice(), value);
                    out.generics.push(object);
                }
            });
            return out;
        }
    }, {
        key: 'chooseParser',
        value: function chooseParser(data) {
            var self = this;
            var out = new Object();
            out.CAN_Id = data[0];
            out.Timestamp = data[1];
            out.raw = new Array();
            for (var i = 2; i < data.length; i++) {
                out.raw.push(data[i].toString(16));
            }
            var spec = this.specification || new _map2.default();
            var map = spec.get(data[0]) || { CAN_Id: data[0], map: [] };
            return this.beginParsing(out, data, map);
            //console.log("looking up database");
        }
    }, {
        key: 'parse',
        value: function parse(data) {
            if (data && data.length > 0) {
                var deferred = Q.defer();
                (0, _setImmediate3.default)(function () {
                    deferred.resolve(Q.fcall(this.chooseParser.bind(this), data));
                }.bind(this));
                return deferred.promise;
            } else return "";
        }
    }]);
    return parseStream;
}(stream.Transform);

module.exports = parseStream;
//# sourceMappingURL=dynamicParser.js.map
