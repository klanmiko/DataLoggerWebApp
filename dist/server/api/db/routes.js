'use strict';

var express = require('express');
var router = express.Router();
var collections = require('./collections/controller.js');
var descriptors = require('./descriptors/controller.js');
router.get('/collections', collections.list);
router.get('/collections/:collection', collections.printData);
router.get('/collections/:collection/download/:fileType', collections.download);
router.get('/descriptors/reset', descriptors.reset);
router.get('/descriptors', descriptors.listDescriptor);
router.get('/descriptors/:descriptor(\\d+)', descriptors.getDescriptor);
router.put('/descriptors/:descriptor(\\d+)', descriptors.updateDescriptor);
router.delete('/descriptors/:descriptor(\\d+)', descriptors.deleteMap);
router.delete('/collections/:collection', collections.deleteCollection);
module.exports.router = router;
module.exports.collections = collections;
module.exports.bind = function (activeCallback) {
    collections.setActive(activeCallback);
};
//# sourceMappingURL=routes.js.map
