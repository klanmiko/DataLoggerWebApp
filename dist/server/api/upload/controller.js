'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
var csv = require('csvtojson');
var Parser = require('../../serial/dynamicParser.js');
module.exports = function index(req, res) {
    var file = req.file;
    var parser = new Parser();
    var array = 0;
    res.write('[');
    var first = true;
    parser.on('data', function (data) {
        var ret = JSON.parse(data);
        delete ret.raw;
        array++;
        if (!first) {
            res.write(',');
        }
        res.write((0, _stringify2.default)(ret));
        first = false;
    });
    var stream = fs.createReadStream(file.path);
    var headerSet = false;
    csv({ workerNum: 4 }).fromStream(stream).on('csv', function (csvRow) {
        if (csvRow.length < 10) return;
        csvRow = csvRow.slice(0, 10);
        if (!headerSet) {
            res.status(200);
            headerSet = true;
        }
        csvRow[0] = parseInt(csvRow[0], 16);
        var radix = 16;
        csvRow[1] = parseInt(csvRow[1]);
        for (var i = 2; i < csvRow.length; i++) {
            var val = parseInt(csvRow[i], radix);
            csvRow[i] = val;
        }
        parser.write((0, _stringify2.default)(csvRow));
        // csvRow is an array
    }).on('done', function (error) {
        if (error) console.error(error);
        console.log("done reading csv");
        console.log('Processed ' + array + ' from csv');
        res.write(']');
        res.end();
    });
};
//# sourceMappingURL=controller.js.map
