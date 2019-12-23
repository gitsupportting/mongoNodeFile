var express = require('express');
var router = express.Router();
var db = require('../db');
var config = require('../config');
var _displayResults = config._displayResults;
var _resultCode = config.result_code;
var _allMatchParamFlag = false;

/* GET method  */
router.get('/query/:recordType', function (req, res, next) {
  var collection = db.get().collection(config.collection);
  var accountId = req.oauth_decoded.pos_client_id;
  var recordType = req.params.recordType;
  if (accountId === undefined || recordType === undefined) {
    res.json(_displayResults(_resultCode.QUERY_PARAMETER_REQUIRE, 'accountId and recordType are requried'));
    return;
  }

  var dataParams = db.getDataParam();
  for (var key in req.query) {
    if (key.indexOf('.') >= 0) {
      var a = key.split('.');
      if (!dataParams.includes(a[1])) {
        var str = dataParams[0];
        for (var i = 1; i < dataParams.length; i++) {
          str += ',' + dataParams[i];
        }
        res.json(_displayResults(_resultCode.QUERY_PARAMETER_REQUIRE, 'No params of ' + a[1] + ' in data. You can consider ' + str));
        return;
      }
    }
  }
  var sortBy = req.query.sortBy;
  var sortDir = req.query.sortDir;
  var condition;
  accountId = parseInt(accountId);
  condition = { accountId: accountId, recordType: recordType };

  for (key in req.query) {
    if (key === 'includeAllMatches') {
      if (req.query[key] === '0') {
        _allMatchParamFlag = true;
      } else {
        _allMatchParamFlag = false;
      }
    }
  }
  for (key in req.query) {
    if (key.indexOf('.') >= 0) {
      var value = req.query[key];
      var pattern = value;
      pattern = pattern.split('$').join('');
      var count$ = value.split('$').length - 1;
      if (count$ === 0) {
        if (!isNaN(pattern)) {
          pattern = parseFloat(pattern);
        }
        condition[key] = pattern;
      }
      if (count$ === 1 && value.indexOf('$') === 0) {
        if (!isNaN(pattern)) {
          pattern = parseFloat(pattern);
          condition[key] = pattern;
        } else {
          if (_allMatchParamFlag) {
            condition[key] = pattern;
          } else {
            pattern = pattern + '$';
            condition[key] = new RegExp(pattern, 'i');
          }
        }
      }
      if (count$ === 1 && value.indexOf('$') > 0) {
        if (!isNaN(pattern)) {
          pattern = parseFloat(pattern);
          condition[key] = pattern;
        } else {
          if (_allMatchParamFlag) {
            condition[key] = pattern;
          } else {
            pattern = '^' + pattern;
            condition[key] = new RegExp(pattern, 'i');
          }
        }
      }
      if (count$ === 2) {
        if (!isNaN(pattern)) {
          pattern = parseFloat(pattern);
          condition[key] = pattern;
        } else {
          if (_allMatchParamFlag) {
            condition[key] = pattern;
          } else {
            condition[key] = new RegExp(pattern, 'i');
          }
        }
      }
    }
  }
  var field = { _id: 0, accountId: 0, recordType: 0 };
  var sort = {};
  if (sortBy !== undefined) {
    a = sortBy.split('.');
    if (dataParams.includes(a[1])) {
      if (sortDir === undefined) {
        if (sortDir === 'DESC' || sortDir === 'ASC') {
          if (sortDir === 'DESC') {
            sort = { [sortBy]: -1 };
          } else {
            sort = { [sortBy]: 1 };
          }
        } else {
          res.json(_displayResults(_resultCode.QUERY_PARAMETER_REQUIRE, 'No parameter: ' + sortDir + " in sortDir. Please choose 'DESC' or 'ASC' for sortDir."));
          return;
        }
      } else {
        sort = { [sortBy]: 1 };
      }
      collection.find(condition).project(field).sort(sort).toArray(function (_err, docs) {
        res.json(_displayResults(_resultCode.QUERY_SUCCESS, getResult(accountId, recordType, docs), true));
      });
    } else {
      res.json(_displayResults(_resultCode.QUERY_PARAMETER_REQUIRE, 'No parameter: ' + sortBy + ' in sortBy.'));
    }
  } else {
    collection.find(condition).project(field).toArray(function (_err, docs) {
      res.json(_displayResults(_resultCode.QUERY_SUCCESS, getResult(accountId, recordType, docs), true));
    });
  }
});

/* POST method  */
router.post('/query/:recordType', function (req, res, next) {
  var accountId = req.oauth_decoded.pos_client_id;
  var recordType = req.params.recordType;
  var data = req.body;
  accountId = req.oauth_decoded.pos_client_id;
  recordType = data[0].recordType;
  if (accountId === undefined || recordType === undefined) {
    res.json(_displayResults(_resultCode.QUERY_PARAMETER_REQUIRE, 'accountId and recordType are requried'));
    return;
  }
  var collection = db.get().collection(config.collection);
  var query = { accountId: parseInt(accountId), recordType: recordType };
  collection.deleteMany(query, function (error, docs) {
    if (error) {
      res.status(401).json(_displayResults(_resultCode.QUERY_EXECUTION_ERROR, error));
    } else {
      for (var i = 0; i < data.length; i++) {
        data[i].accountId = parseInt(accountId);
      }
      var result = insertDocs(data);
      res.json(_displayResults(_resultCode.QUERY_SUCCESS, result, true));
    }
  });
});

function insertDocs (data) {
  var collection = db.get().collection(config.collection);
  collection.insertMany(data, function (error, inserted) {
    if (error) {
      console.error(error);
      return error;
    } else {
      console.log('Successfully inserted: ', data.length);
      return 'Successfully inserted: n = ' + data.length;
    }
  });
  return 'Successfully inserted: n = ' + data.length;
}

function getResult (accountId, recordType, docs) {
  var result = {
    accountId: accountId,
    recordType: recordType,
    recordDate: '',
    elapsedMinutes: '',
    data: []
  };
  if (docs.length > 0) {
    result.recordDate = docs[0].recordDate;
    var currentTime = new Date();
    var recordTime = new Date(result.recordDate);
    var elapsedMinutes = (currentTime - recordTime) / 1000 / 60;
    result.elapsedMinutes = elapsedMinutes;
    for (var i = 0; i < docs.length; i++) {
      // if(_allMatchParamFlag == true && i > 0){
      //     continue;
      // }
      result.data.push(docs[i].data);
    }
  }
  return result;
}

module.exports = router;
