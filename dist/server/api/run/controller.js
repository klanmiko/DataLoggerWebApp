'use strict';

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dbStream = require('../../db/dbStream.js');

var Controller = function () {
    function Controller(db, parser) {
        (0, _classCallCheck3.default)(this, Controller);

        this.db = db;
        this.parser = parser;
        this.cache = new _map2.default();
        this.hookParser(this.parser);
        this.db.ready(function () {
            this.collection = this.db.collection;
        }.bind(this));
    }

    (0, _createClass3.default)(Controller, [{
        key: 'getActive',
        value: function getActive() {
            return this.collection;
        }
    }, {
        key: 'hookParser',
        value: function hookParser(parser) {
            this.cache.clear();
            parser.on('data', function (data) {
                this.cache.set(data.CAN_Id, data);
            }.bind(this));
        }
    }, {
        key: 'start',
        value: function start(req, res) {
            if (!this.parser.isPaused()) {
                res.sendStatus(401);
                return;
            }
            var database = new dbStream();
            this.parser.resume();
            this.hookParser(this.parser);
            database.ready(function () {
                this.collection = database.collection;
                res.status(200).send(database.collection.collectionName);
            }.bind(this));
            this.db = database;
        }
    }, {
        key: 'stop',
        value: function stop(req, res) {
            this.parser.unpipe();
            this.parser.pause();
            this.parser.specification = [];
            this.db.save();
            this.cache.clear();
            res.status(200).send("Stopped");
        }
    }, {
        key: 'current',
        value: function current(req, res) {
            if (this.parser.isPaused()) res.status(200).send("Stopped");else if (this.db && this.db.collection && this.db.collection.collectionName) res.status(200).send(this.db.collection.collectionName);else {
                res.send("demo");
            }
        }
    }, {
        key: 'last',
        value: function last(req, res) {
            if (!req.query.CAN_Id) {
                res.sendStatus(404);
                return;
            }
            req.query.CAN_Id = parseInt(req.query.CAN_Id);
            if (!this.cache.has(req.query.CAN_Id)) res.sendStatus(404);else {
                res.send(this.cache.get(req.query.CAN_Id));
            }
        }
    }]);
    return Controller;
}();

module.exports = Controller;
//# sourceMappingURL=controller.js.map
