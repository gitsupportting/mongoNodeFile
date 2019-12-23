var express = require('express');
var router = express.Router();
var config = require('../config');
var _resultCode = config.result_code;
var _displayResults = config._displayResults;

var jwt = require('jsonwebtoken');
var jwksClient = require('jwks-rsa');
var client = jwksClient({
  jwksUri: config.jwksUri
});

function getKey (header, callback) {
  client.getSigningKey(header.kid, function (_err, key) {
    if (key !== undefined) {
      var signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    } else {
      callback(null, null);
    }
  });
}

router.use(async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      res.status(401).json(_displayResults(_resultCode.NEED_AUTHORIZATION_HEADER, 'You must send an OAuth token'));
      return;
    }

    const [authType, token] = authorization.split(' ');
    if (authType !== 'Bearer') {
      res.status(401).json(_displayResults(_resultCode.EXPECTED_BEARER_TOKEN, 'Expected a Bearer token'));
      return;
    }

    jwt.verify(token, getKey, function (err, decoded) {
      if (decoded !== undefined && err == null) {
        // if everything is good, save to request for oauth token in other routes
        req.oauth_decoded = decoded;
        next();
      } else {
        res.status(401).json(_displayResults(_resultCode.TOKEN_AUTHORIZATION_FAILED, err));
      }
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

module.exports = router;
