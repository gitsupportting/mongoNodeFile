// var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');

var ODataServer = require('simple-odata-server');
var Adapter = require('simple-odata-server-mongodb');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var getdataRouter = require('./routes/getdata');
var recordType = require('./routes/recordType');
var accountId = require('./routes/accountId');
var query = require('./routes/query');
var oauth = require('./routes/oauth2');
var order = require('./routes/order');
var file = require('./routes/file');
var userAuth = require('./routes/authenticate');

var app = express();
app.use(cors());
var config = require('./config');
var db = require('./db');
var _dbUrl = config.db_url;
var dbname = config.database;

// swagger document
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json({ limit: '50Mb', type: 'application/json' }));
app.use(express.urlencoded({ limit: '50Mb', extended: false }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50Mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ limit: '50Mb', extended: false, parameterLimit: 5000 }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));

/* set JWT token */
app.use('/userauth', userAuth);
app.use('/getdata', userAuth);

app.use('/', indexRouter);
app.use('/getdata', getdataRouter);
app.use('/recordType', recordType);
app.use('/accountId', accountId);

/* set JWT token */
app.use('/orders/for-user', userAuth);
app.use('/orders/for-user', oauth);
app.use('/orders/validate', userAuth);
app.use('/orders/validate', oauth);
app.use('/orders', userAuth);
app.use('/orders', oauth);

/* set OAuth token verification */
app.use('/query', oauth);
app.use('/files', userAuth);
app.use('/menu', oauth);
app.use('/orders/:orderId/ack', oauth);

/* user create and login */
app.use('/', usersRouter);

/* order validate and submit */
app.use('/', order);
/* various queries */
app.use('/', query);
/* file control API */
app.use('/', file);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var entityType = config.database + '.Product';
var model = {
  namespace: config.database,
  entityTypes: {
    'Product': {
      '_id': { 'type': 'Edm.String', key: true },
      'accountId': { 'type': 'Edm.String' },
      'recordType': { 'type': 'Edm.String' },
      'dateRecorded': { 'type': 'Edm.String' },
      'data': { 'type': 'Edm.Data' }
    },
    'Data': {
      'SalesProductId': { 'type': 'Edm.String' },
      'SalesProductName': { 'type': 'Edm.String' },
      'SalesCategoryName': { 'type': 'Edm.String' }
    }
  },
  entitySets: {
    [config.collection]: {
      entityType: entityType
    }
  }
};

// Instantiates ODataServer and assigns to odataserver variable.
var odataServer = new ODataServer()
  .model(model);

// Connect to Mongo on start
db.connect(_dbUrl, dbname, function (err) {
  if (err) {
    console.log(err);
    console.log('Unable to connect to Mongo.');
    process.exit(1);
  } else {
    console.log('Connected successfully database...');
    var dbo = db.get();
    odataServer.adapter(Adapter(function (cb) { cb(err, dbo); }));
  }
});

// ---------- For test as local data ---------------
var coursesData = [
  {
    id: 1,
    title: 'The Complete Node.js Developer Course',
    author: 'Andrew Mead, Rob Percival',
    description: 'Learn Node.js by building real-world applications with Node, Express, MongoDB, Mocha, and more!',
    topic: 'Node.js',
    url: 'https://codingthesmartway.com/courses/nodejs/'
  }
];



var getCourse = function (args) {
  var id = args.id;
  return coursesData.filter(course => {
    return course.id === id;
  })[0];
};

var getCourses = function (args) {
  if (args.topic) {
    var topic = args.topic;
    return coursesData.filter(course => course.topic === topic);
  } else {
    return coursesData;
  }
};

var updateCourseTopic = function ({ id, topic }) {
  coursesData.map(course => {
    if (course.id === id) {
      course.topic = topic;
      return course;
    }
  });
  return coursesData.filter(course => course.id === id)[0];
};

var getProducts = async (args) => {
  var collection = db.get().collection(config.collection);
  if (args.recordType) {
    var pattern = args.recordType;
    var result = await collection.find({ 'recordType': pattern }).toArray();
    return result;
  }

  if (args.substringofRecordType) {
    pattern = args.substringofRecordType;
    result = await collection.find({ 'recordType': { $regex: new RegExp(pattern), $options: 'i' } }).toArray();
    return result;
  }

  if (args.startswithRecordType) {
    pattern = '^' + args.startswithRecordType;
    result = await collection.find({ 'recordType': { $regex: new RegExp(pattern), $options: 'i' } }).toArray();
    return result;
  }

  if (args.endswithRecordType) {
    pattern = args.endswithRecordType + '$';
    result = await collection.find({ 'recordType': { $regex: new RegExp(pattern), $options: 'i' } }).toArray();
    return result;
  }
};
// Root resolver
var root = {
  course: getCourse,
  courses: getCourses,
  updateCourseTopic: updateCourseTopic,
  products: getProducts
};

// OData
app.use('/odata', function (req, res) {
  odataServer.handle(req, res);
});

module.exports = app;
