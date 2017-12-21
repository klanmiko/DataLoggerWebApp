/**
 * Express configuration
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (app) {
  var env = app.get('env');

  if (env === 'development' || env === 'test') {
    app.use(_express2.default.static(_path2.default.join(_environment2.default.root, '.tmp')));
  }

  if (env === 'production') {
    app.use((0, _serveFavicon2.default)(_path2.default.join(_environment2.default.root, 'client', 'favicon.ico')));
  }

  app.set('appPath', _path2.default.join(_environment2.default.root, 'client'));
  app.use(_express2.default.static(app.get('appPath')));
  app.use((0, _morgan2.default)('dev', { stream: require('../console/log.js').logStream }));

  app.set('views', _environment2.default.root + '/server/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use((0, _shrinkRay2.default)());
  app.use(_bodyParser2.default.urlencoded({ extended: false }));
  app.use(_bodyParser2.default.json());
  app.use((0, _methodOverride2.default)());
  app.use((0, _cookieParser2.default)());

  // Persist sessions with MongoStore / sequelizeStore
  // We need to enable sessions for passport-twitter because it's an
  // oauth 1.0 strategy, and Lusca depends on sessions
  app.use((0, _expressSession2.default)({
    secret: _environment2.default.secrets.session,
    saveUninitialized: true,
    resave: false
  }));

  /**
   * Lusca - express server security
   * https://github.com/krakenjs/lusca
   */
  if (env !== 'test' && !process.env.SAUCE_USERNAME) {
    app.use((0, _lusca2.default)({
      csrf: {
        angular: true
      },
      xframe: 'SAMEORIGIN',
      hsts: {
        maxAge: 31536000, //1 year, in seconds
        includeSubDomains: true,
        preload: true
      },
      xssProtection: true
    }));
  }

  if (env === 'development') {
    var webpackDevMiddleware = require('webpack-dev-middleware');
    var stripAnsi = require('strip-ansi');
    var webpack = require('webpack');
    var makeWebpackConfig = require('../../webpack.make');
    var webpackConfig = makeWebpackConfig({ DEV: true });
    var compiler = webpack(webpackConfig);
    var browserSync = require('browser-sync').create();

    /**
     * Run Browsersync and use middleware for Hot Module Replacement
     */
    browserSync.init({
      open: false,
      logFileChanges: false,
      proxy: 'localhost:' + _environment2.default.port,
      ws: true,
      middleware: [webpackDevMiddleware(compiler, {
        noInfo: false,
        stats: {
          colors: true,
          timings: true,
          chunks: false
        }
      })],
      port: _environment2.default.browserSyncPort,
      plugins: ['bs-fullscreen-message']
    });

    /**
     * Reload all devices when bundle is complete
     * or send a fullscreen error message to the browser instead
     */
    compiler.plugin('done', function (stats) {
      console.log('webpack done hook');
      if (stats.hasErrors() || stats.hasWarnings()) {
        return browserSync.sockets.emit('fullscreen:message', {
          title: 'Webpack Error:',
          body: stripAnsi(stats.toString()),
          timeout: 100000
        });
      }
      browserSync.reload();
    });
  }

  if (env === 'development' || env === 'test') {
    app.use((0, _errorhandler2.default)()); // Error handler - has to be last
  }
};

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _shrinkRay = require('shrink-ray');

var _shrinkRay2 = _interopRequireDefault(_shrinkRay);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _methodOverride = require('method-override');

var _methodOverride2 = _interopRequireDefault(_methodOverride);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _errorhandler = require('errorhandler');

var _errorhandler2 = _interopRequireDefault(_errorhandler);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lusca = require('lusca');

var _lusca2 = _interopRequireDefault(_lusca);

var _environment = require('./environment');

var _environment2 = _interopRequireDefault(_environment);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _connectMongo = require('connect-mongo');

var _connectMongo2 = _interopRequireDefault(_connectMongo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
var MongoStore = (0, _connectMongo2.default)(_expressSession2.default);
//# sourceMappingURL=express.js.map
