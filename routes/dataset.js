var express = require('express');
var router = express.Router();
var db = require('../db');
var config = require('../config');

/* get all data  */
router.get('/', function (req, res, next) {
  var collection = db.get().collection(config.collection);
  collection.find().project({ _id: 0 }).toArray(function (_err, docs) {
    console.log(docs);
    res.json({ 'result': docs });
  });
});

/* get filtered data  */
router.get('/:recordtype', function (req, res, next) {
  var recordtype = req.params.recordtype;
  if (recordtype !== undefined) {
    var collection = db.get().collection(config.collection);
    var pattern = recordtype;
    collection.find({ 'recordType': new RegExp(pattern, 'i') }).project({ _id: 0 }).toArray(function (_err, docs) {
      res.json({ 'result': docs });
    });
  } else {
    res.json({ message: 'Not Found' });
  }
});

module.exports = router;
