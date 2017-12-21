'use strict';

var express = require('express');
var Controller = require('./controller.js');
module.exports = function (db, parser) {
    this.router = express.Router();
    this.controller = new Controller(db, parser);
    this.router.get('/start', this.controller.start.bind(this.controller));
    this.router.get('/stop', this.controller.stop.bind(this.controller));
    this.router.get('/current', this.controller.current.bind(this.controller));
    this.router.get('/last', this.controller.last.bind(this.controller));
    return {
        callback: this.controller.getActive.bind(this.controller),
        router: this.router
    };
};
//# sourceMappingURL=routes.js.map
