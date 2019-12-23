var MongoClient = require('mongodb').MongoClient;
var config = require('./config');

var state = {
  db: null,
  data_params: []
};

exports.connect = function (url, dbname, done) {
  if (state.db) return done();
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) return done(err);
    state.db = db.db(dbname);
    // ----- get data param -------
    var collection = db.db(config.database).collection(config.collection);
    collection.find().project({ _id: 0 }).toArray(function (_err, docs) {
      docs.forEach(element => {
        for (var key in element.data) {
          if (!state.data_params.includes(key)) {
            state.data_params.push(key);
          }
        }
      });
      state.data_params.sort();
    });
    // ----- end of get data param ---
    done();
  });
};

exports.get = function () {
  return state.db;
};

exports.getDataParam = function () {
  return state.data_params;
};

exports.close = function (done) {
  if (state.db) {
    state.db.close(function (err, result) {
      state.db = null;
      state.mode = null;
      done(err);
    });
  }
};
