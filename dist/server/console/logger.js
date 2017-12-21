'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

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

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stream = require('stream');
var StringDecoder = require('string_decoder').StringDecoder;
var sprintf = require("sprintf-js").sprintf;
var decoder = new StringDecoder('utf8');
var blessed = require('blessed');
var util = require('util');
var screen = blessed.screen({
    smartCSR: true
});
screen.title = 'DataLogger';
var canMessages = new _map2.default();
// Create a box perfectly centered horizontally and vertically.
var left = blessed.text({
    top: 'center',
    left: '0',
    width: '50%',
    height: '100%',
    tags: true,
    scrollable: true,
    alwaysScroll: true,
    border: {
        type: 'line'
    },
    scrollbar: true,
    style: {
        fg: 'white',
        bg: 'black',
        border: {
            fg: '#f0f0f0'
        },
        hover: {
            bg: 'green'
        }
    }
});
var right = blessed.listtable({
    top: 'center',
    right: '0',
    width: '50%',
    height: '100%',
    tags: true,
    scrollable: false,
    border: {
        type: 'line'
    },
    style: {
        fg: 'white',
        bg: 'black',
        border: {
            fg: '#f0f0f0'
        },
        hover: {
            bg: 'green'
        }
    }
});
// Append our box to the screen.
screen.append(left);
screen.append(right);
// Add a png icon to the box

// If our box is clicked, change the content.

// Quit on Escape, q, or Control-C.
screen.key(['escape', 'q', 'C-c'], function (ch, key) {
    return process.exit(0);
});

// Focus our element.
left.focus();

// Render the screen.
screen.render();
function log(input) {
    if (!(typeof input === 'string')) {
        input = util.inspect(input);
    }
    input = blessed.escape(input);
    left.pushLine(input);
    left.setScrollPerc(100);
    screen.render();
}

module.exports.log = log;

var LogStream = function (_stream$Writable) {
    (0, _inherits3.default)(LogStream, _stream$Writable);

    function LogStream(options) {
        (0, _classCallCheck3.default)(this, LogStream);
        return (0, _possibleConstructorReturn3.default)(this, (LogStream.__proto__ || (0, _getPrototypeOf2.default)(LogStream)).call(this, options));
    }

    (0, _createClass3.default)(LogStream, [{
        key: '_write',
        value: function _write(chunk, encoding, next) {
            log(decoder.write(chunk));
            next();
        }
    }]);
    return LogStream;
}(stream.Writable);

module.exports.logStream = new LogStream({ decodeStrings: true });
module.exports.set = function (msg) {
    var string = '';
    canMessages.set(msg[0], msg.slice(1, msg.length - 1));
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (0, _getIterator3.default)(canMessages), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _step$value = (0, _slicedToArray3.default)(_step.value, 2),
                key = _step$value[0],
                value = _step$value[1];

            string += sprintf('%5X: %08d', key, value[0]);
            for (var i = 1; i < value.length; i++) {
                string += sprintf(' %02X', value[i]);
            }
            string += '\n';
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

    right.setContent(string);
    screen.render();
};
module.exports.error = function (input) {
    if (!(typeof input === 'string')) input = util.inspect(input);
    input = blessed.generateTags({
        fg: 'red'
    }, blessed.escape(input));

    left.pushLine(input);
    left.setScrollPerc(100);
    screen.render();
};
//# sourceMappingURL=logger.js.map
