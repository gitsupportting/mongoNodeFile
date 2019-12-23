var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

var fs = require('fs');

function readJsonFileSync (filepath, encoding) {
  if (typeof (encoding) === 'undefined') {
    encoding = 'utf8';
  }
  var file = fs.readFileSync(filepath, encoding);
  return JSON.parse(file);
}

function getConfig (file) {
  // eslint-disable-next-line no-path-concat
  // var filepath = __dirname + '/' + file;
  var filepath = file;
  return readJsonFileSync(filepath);
}

// assume that config.json is in application root

var json = getConfig('swagger.json');

/* GET swagger.json */
router.get('/swagger.json', function (req, res, next) {
  res.json(json);
});

module.exports = router;
