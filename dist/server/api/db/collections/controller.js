"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.list = list;
exports.download = download;
exports.setActive = setActive;
exports.deleteCollection = deleteCollection;
exports.printData = printData;
var database;
var activeCallback;

function sort(collections) {
  collections.sort(function (a, b) {
    return -a.localeCompare(b);
  });
}
function quicksort(collections, low, high) {
  if (low < high) {
    var pivot = collections[high];
    var i = low;
    for (var j = low; j < high; j++) {
      if (collections[j].localeCompare(pivot) > -1) {
        var temp = collections[j];
        collections[j] = collections[i];
        collections[i] = temp;
        i = i + 1;
      }
    }
    var swap = collections[high];
    collections[high] = collections[i];
    collections[i] = swap;
    quicksort(collections, low, i - 1);
    quicksort(collections, i + 1, high);
  }
}

function list(req, res) {
  var collections = [];
  res.status(200).send(collections);
}
function download(req, res) {
  var name = req.params.collection;
  var fileType = req.params.fileType;
  if (fileType == "json") {
    res.attachment(name + ".json");
  } else if (fileType == "csv") res.attachment(name + ".csv");else {
    res.status(401).end();
    return;
  }
  res.status(200).send();
}
function setActive(callback) {
  activeCallback = callback;
}
function deleteCollection(req, res) {
  var name = req.params.collection;
  res.sendStatus(200);
}
function printData(req, res) {
  var start;
  var end;
  var name = req.params.collection;
  if (req.query.start) start = parseInt(req.query.start);
  if (req.query.end) end = parseInt(req.query.end);
  elements = [];
  res.status(200).send(elements);
}
//# sourceMappingURL=controller.js.map
