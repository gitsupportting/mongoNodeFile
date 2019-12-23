var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../config');
var _resultCode = config.result_code;
var _displayResults = config._displayResults;
// set secret

var key = config.secret_key;

router.use((req, res, next) => {
  // check header for the token
  var headers = req.headers;
  var authorization = headers['x-pos-user-token'];
  if (authorization) {
    var token = authorization;
    // var [authType, token] = authorization.split(' ');
    // if (authType !== 'Bearer') {
    //   res.status(401).json(_displayResults(_resultCode.EXPECTED_BEARER_TOKEN, 'Expected a Bearer token'));
    //   return;
    // }
    // decode token
    if (token) {
      // verifies secret and checks if the token is expired
      jwt.verify(token, key, (err, decoded) => {
        if (err) {
          res.status(401).json(_displayResults(_resultCode.INVALID_USER_TOKEN, 'Invalid token'));
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });
    }
  } else {
    // if there is no token
    res.status(401).json(_displayResults(_resultCode.USER_TOKEN_NO_PROVIDED, 'Must set user token'));
  }
});

module.exports = router;
