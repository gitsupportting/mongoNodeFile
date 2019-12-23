var express = require('express');
var router = express.Router();
var md5 = require('js-md5');
var uniqid = require('uniqid');
var db = require('../db');
var config = require('../config');
var _resultCode = config.result_code;
var _displayResults = config._displayResults;

function validate (order) {
  var productId = order.products[0].productId;
  var sizeId = order.products[0].sizeId;
  var price = order.products[0].price;
  var key = order.products[0].key;
  var SALT_STRING = 'SALT';
  var str = productId + '-' + sizeId + '-' + price + '-' + SALT_STRING;
  console.log(md5(str).substring(0, 10));
  if (md5(str).substring(0, 10) === key) {
    return true;
  } else {
    return false;
  }
}

/* Order validate : POST */
router.post('/orders/validate', function (req, res) {
  var order = req.body;
  if (isEmpty(order)) {
    res.status(405).json(_displayResults(_resultCode.ORDER_EMPTY_OBJECT, 'Empty object'));
    return;
  }
  if (validate(order)) {
    res.json(_displayResults(_resultCode.ORDER_VALIDATE_SUCCESS, 'Order validated', true));
  } else {
    res.status(201).json(_displayResults(_resultCode.ORDER_VALIDATE_FAILED, 'Can not validate the order'));
  }
});

/* Save order : POST */
router.post('/orders', function (req, res) {
  var order = req.body;
  if (isEmpty(order)) {
    res.status(405).json(_displayResults(_resultCode.ORDER_EMPTY_OBJECT, 'Empty object'));
    return;
  }
  if (!validate(order)) {
    res.status(201).json(_displayResults(_resultCode.ORDER_VALIDATE_FAILED, 'Can not validate the order'));
  } else {
    var collection = db.get().collection(config.orderCollection);
    var accountId = order.account.accountId;
    var email = order.account.emailAddress;
    var query = { 'account.accountId': accountId, 'account.emailAddress': email };
    collection.find(query).toArray(function (_err, docs) {
      if (docs.length === 0) {
        order.id = uniqid.time();
        collection.insertOne(order, function (_err, inserted) {
          res.json(_displayResults(_resultCode.ORDER_SAVED_SUCCESS, { id: order.id }, true));
        });
      } else {
        res.json(_displayResults(_resultCode.ORDER_ALREADY_EXIST, 'This order already exist'));
      }
    });
  }
});

/* Get order : GET */
router.get('/orders/for-user', function (req, res) {
  var userId = req.decoded.subject;
  var query = { 'account.accountId': userId };
  var collection = db.get().collection(config.orderCollection);
  collection.find(query).toArray(function (_err, docs) {
    if (docs.length === 0) {
      res.status(201).json(_displayResults(_resultCode.NO_ORDERS_MATCH_USERID, 'No orders matched the userid'));
    } else {
      res.json(_displayResults(_resultCode.ORDERS_GET_BY_USERID, docs));
    }
  });
});

/* Get orders not yet processed : GET */
router.get('/orders/status', function (req, res) {
  var accountId = req.oauth_decoded.pos_client_id;
  var status = req.query.status;
  if (status === undefined) {
    res.status(405).json(_displayResults(_resultCode.NO_SUCH_STATUS, 'status is undefined'));
    return;
  }
  if (status === 'pending') {
    var query = { 'account.accountId': accountId, 'isProcessed': 0 };
    var collection = db.get().collection(config.orderCollection);
    collection.find(query).toArray(function (_err, docs) {
      res.json(_displayResults(_resultCode.ORDERS_OF_PENGIND, docs));
    });
  } else {
    res.status(405).json(_displayResults(_resultCode.NO_SUCH_STATUS, 'Invalid status'));
  }
});

/* Get orders by orderid : POST */
router.post('/orders/:orderId/ack', function (req, res) {
  var accountId = req.oauth_decoded.pos_client_id;
  var orderId = req.params.orderId;
  var query = { 'account.accountId': accountId, id: orderId };
  var collection = db.get().collection(config.orderCollection);
  collection.find(query).toArray(function (_err, docs) {
    if (docs.length === 0) {
      res.status(201).json(_displayResults(_resultCode.NO_ORDERS_BY_ORDERID, 'No orders matched orderId'));
    } else {
      res.json(_displayResults(_resultCode.ORDERS_GET_BY_ORDERID, docs));
    }
  });
});

// check if obj is empty or not
function isEmpty (obj) {
  if (typeof (obj) === 'string') {
    return false;
  }
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

module.exports = router;
