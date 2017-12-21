'use strict';

var express = require('express');
var controller = require('./controller.js');
var router = express.Router();
var path = require('path');
var multer = require('multer');
var upload = multer({
    dest: path.join(__dirname, 'files/')
});
router.post('/', upload.single('file'), controller);
module.exports = router;
//# sourceMappingURL=routes.js.map
