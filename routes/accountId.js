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
// router.get('/:accountId', function(req, res, next) {
//     var accountId = req.params.accountId;
//     if(accountId != undefined){
//       var collection = db.get().collection(config.collection)
//       var pattern = accountId
//       collection.find( { "accountId": new RegExp(pattern, 'i') }).project({_id:0}).toArray(function(err, docs){
//           res.json({"result":docs})
//       })
//       return;
//     } else{
//       res.json({message: "Not Found"});
//       return;
//     }
// });

module.exports = router;
