/**
 * Main application routes
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (app, parser, db) {
  // Insert routes below
  var run = new Run(db, parser);
  app.use('/api/run', run.router);
  var dbRoutes = require('./api/db/routes.js');
  console.log(run.callback);
  dbRoutes.bind(run.callback);
  app.use('/api/db', dbRoutes.router);
  app.use('/api/upload', require('./api/upload/routes.js'));
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*').get(_errors2.default[404]);
  // All other routes should redirect to the index.html
  app.route('/*').get(function (req, res) {
    res.sendFile(_path2.default.resolve(app.get('appPath') + '/index.html'));
  });
};

var _errors = require('./components/errors');

var _errors2 = _interopRequireDefault(_errors);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Run = require('./api/run/routes.js');
//# sourceMappingURL=routes.js.map
