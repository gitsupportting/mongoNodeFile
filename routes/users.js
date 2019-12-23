var express = require('express');
// var fetch = require('node-fetch');
// var FormData = require('form-data');
var jwt = require('jsonwebtoken');
var md5 = require('js-md5');
var uniqid = require('uniqid');
var fs = require('fs');
var rimraf = require('rimraf');
var router = express.Router();
var db = require('../db');
var config = require('../config');
var _resultCode = config.result_code;
var _displayResults = config._displayResults;
var Path = require('path');
// var email = require("emailjs");
var email = require('../node_modules/emailjs/email');

var server = email.server.connect({
  user: 'baymax.development@gmail.com',
  password: 'sbaetyffyhzjscgk',
  host: 'smtp.gmail.com',
  ssl: true
});

// $email_config = array(
//   'email_address' => 'com.tarbon.springo@gmail.com',
//   'email_password' => '2l883RbUtx',
//   'email_subject' => 'Fitness Mail system',
//   'email_name' => 'Fitness App',
//   'smtp_host' => 'smtp.gmail.com',
//   'smtp_port' => '587',
//   'smtp_encrypt' => 'tls'
//   );
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'User' });
});

/* Create user account : POST */
router.post('/users/signup', function (req, res, next) {
  var email = req.body.email;
  if (email === undefined) {
    res.status(405).json(_displayResults(_resultCode.EMAIL_UNDEFINED, 'Email(email) is undefined'));
    return;
  }
  var password = req.body.password;
  if (password === undefined) {
    res.status(405).json(_displayResults(_resultCode.PASSWORD_UNDEFINED, 'Password(password) is undefined'));
    return;
  }
  var name = req.body.name;
  if (name === undefined) {
    res.status(405).json(_displayResults(_resultCode.NAME_UNDEFINED, 'Name(name) is undefined'));
    return;
  }
  var role = req.body.role;
  if (role === undefined) {
    res.status(405).json(_displayResults(_resultCode.ROLE_UNDEFINED, 'Phone number(role) is undefined'));
    return;
  }

  var collection = db.get().collection(config.userCollection);
  var query = { 'email': email };
  collection.find(query).toArray(function (_err, docs) {
    if (docs.length === 0) {
      query = { 'user_id': uniqid.time(), 'email': email, 'password': md5(password), 'name': name, 'role': role, 'ExpirationDays': 0, 'userCode': 0 };
      collection.insertOne(query, function (_err, inserted) {
        res.json(_displayResults(_resultCode.USER_CREATED_SUCCESS, 'Successfully created', true));
      });
    } else {
      res.status(201).json(_displayResults(_resultCode.EMAIL_ALREADY_EXIST, 'This email already exist'));
    }
  });
});
/* Create galleries : POST */
router.post('/users/addGalleries', function (req, res, next) {
  var GalleryName = req.body.GalleryName;
  if (GalleryName === undefined) {
    res.status(405).json(_displayResults(_resultCode.GALLERYNAME_UNDEFINED, 'GalleryName is undefined'));
    return;
  }
  var user_id = req.body.user_id;
  if (user_id === undefined) {
    res.status(405).json(_displayResults(_resultCode.USERID_UNDEFINED, 'userId is undefined'));
    return;
  }

  var collection = db.get().collection(config.galleryCollection);
  var query = { 'GalleryName': GalleryName, 'user_id': user_id };
  collection.find(query).toArray(function (_err, docs) {
    if (docs.length === 0) {
      query = { 'gallery_id': uniqid.time(), 'GalleryName': GalleryName, 'user_id': user_id };
      collection.insertOne(query, function (_err, inserted) {
        res.json(_displayResults(_resultCode.GALLERY_CREATED_SUCCESS, 'Successfully created', true));
      });
    } else {
      res.status(201).json(_displayResults(_resultCode.GALLERY_ALREADY_EXIST, 'This gallery already exist'));
    }
  });
});

/* Delete Gallery: Post */

router.post('/users/deleteFolder', function (req, res) {
  var user_id = req.body.user_id;
  var GalleryName = req.body.GalleryName;
  var path = 'uploads/' + user_id + '/' + GalleryName;
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file, index) => {
      const curPath = Path.join(path, file);
      if (!fs.lstatSync(curPath).isDirectory()) { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
  var collection = db.get().collection(config.galleryCollection);
  var query = { 'GalleryName': GalleryName, 'user_id': user_id };
  console.log(GalleryName);
  console.log(user_id);
  collection.find(query).toArray(function (_err, docs) {
    if (docs.length !== 0) {
      query = { 'GalleryName': GalleryName, 'user_id': user_id };
      collection.deleteOne(query, function (_err, inserted) {
        // res.json(_displayResults(_resultCode.GALLERY_DELETE_SUCCESS, 'Successfully deleted', true));
        collection = db.get().collection(config.imageCollection);
        query = { 'GalleryName': GalleryName, 'user_id': user_id };
        collection.find(query).toArray(function (_err, docs) {
          if (docs.length !== 0) {
            query = { 'GalleryName': GalleryName, 'user_id': user_id };
            collection.deleteMany(query, function (_err, inserted) {
              res.json(_displayResults(_resultCode.GALLERY_DELETE_SUCCESS, 'Successfully deleted', true));
            });
          } else {
            res.status(201).json(_displayResults(_resultCode.GALLERY_ALREADY_DELETED, 'This gallery already delete'));
          }
        });
      });
    } else {
      res.status(201).json(_displayResults(_resultCode.GALLERY_ALREADY_DELETED, 'This gallery already delete'));
    }
  });
});

/* Delete Image */

router.post('/users/deleteImage', function (req, res) {
  var user_id = req.body.user_id;
  var GalleryName = req.body.GalleryName;
  var filename = req.body.filename;
  var curPath = 'uploads/' + user_id + '/' + GalleryName + '/' + filename;
  if (!fs.lstatSync(curPath).isDirectory()) { // delete file
    fs.unlinkSync(curPath);
  }
  var collection = db.get().collection(config.imageCollection);
  var query = { 'GalleryName': GalleryName, 'user_id': user_id, 'filename': filename };
  collection.find(query).toArray(function (_err, docs) {
    if (docs.length !== 0) {
      query = { 'GalleryName': GalleryName, 'user_id': user_id, 'filename': filename };
      collection.deleteOne(query, function (_err, inserted) {
        res.json(_displayResults(_resultCode.GALLERY_DELETE_SUCCESS, 'Successfully deleted', true));
      });
    } else {
      res.status(201).json(_displayResults(_resultCode.GALLERY_ALREADY_DELETED, 'This gallery already delete'));
    }
  });
});

/* Get users: Get */
router.get('/users', (req, res) => {
  var collection = db.get().collection(config.userCollection);
  collection.find().toArray((err, results) => {
    res.send(results);
  });
});

/* Get galleries: Post */
router.post('/users/galleries', (req, res) => {
  var user_id = req.body.user_id;
  if (user_id === undefined) {
    res.status(405).json(_displayResults(_resultCode.USERID_UNDEFINED, 'userId is undefined'));
    return;
  }
  var collection = db.get().collection(config.galleryCollection);
  var query = { 'user_id': user_id };
  collection.find(query).toArray((err, results) => {
    res.send(results);
  });
});

/* User login : POST */
router.post('/users/login', function (req, res, next) {
  var email = req.body.email;
  if (email === undefined) {
    res.status(405).json(_displayResults(_resultCode.EMAIL_UNDEFINED, 'Email(email) is undefined'));
    return;
  }
  var password = req.body.password;
  if (password === undefined) {
    res.status(405).json(_displayResults(_resultCode.PASSWORD_UNDEFINED, 'Password(password) is undefined'));
    return;
  }
  var collection = db.get().collection(config.userCollection);
  var query = { 'email': email };
  collection.find(query).toArray(function (_err, docs) {
    if (docs.length === 0) {
      res.status(201).json(_displayResults(_resultCode.LOGIN_EMAIL_INVALID, 'No user of this email. Please create new account'));
    } else {
      query = { 'email': email, 'password': md5(password) };
      collection.find(query).toArray(function (_err, docs) {
        if (docs.length === 0) {
          res.status(201).json(_displayResults(_resultCode.LOGIN_PASSWORD_INVALID, 'Password is incorrect'));
        } else {
          // if eveything is okey let's create our token
          var userId = docs[0]['user_id'];
          const payload = {
            audience: config.user_token.audience,
            issuer: config.user_token.issuer,
            subject: userId,
            notBefore: (new Date()).toISOString()
          };
          var key = config.secret_key;
          var token = jwt.sign(payload, key, {
            expiresIn: 3600 * 24 // expires in 1 hour
          });
          var result = {
            message: 'user authentication done',
            token: token
          };
          res.json(_displayResults(_resultCode.LOGIN_SUCCESS, result, true));

          // var obj = config.params_to_get_new_access_token;
          // let form_data = new FormData();
          // for (let key in obj) {
          //   form_data.append(key, obj[key]);
          // }
          // (async () => {
          //   const rawResponse = await fetch(config.token_endpoint, {
          //     method: 'POST',
          //     body: form_data
          //   });
          //   const result = await rawResponse.json();
          //   if(result.access_token){
          //     res.json(_displayResults(_resultCode.LOGIN_SUCCESS, result));
          //   } else{
          //     res.json(_displayResults(_resultCode.LOGIN_GET_TOKEN_ERROR, result));
          //   }
          // })();
        }
      });
    }
  });
});

router.post('/users/addExpirationdays', function (req, res) {
  var user_id = req.body.user_id;
  var ExpirationDays = req.body.ExpirationDays;
  var userCode = req.body.userCode;
  var collection = db.get().collection(config.userCollection);
  var query = { 'user_id': user_id };
  collection.find(query).toArray(function (_err, docs) {
    if (docs.length !== 0) {
      collection.findOneAndUpdate(
        { 'user_id': user_id },
        { '$set': { 'ExpirationDays': ExpirationDays, 'userCode': userCode } },
        function (err, doc) {
          if (err) { // err: any errors that occurred
            // console.log(err);
            // res.json(_displayResults(err));
            res.send(err);
          } else { // doc: the document before updates are applied if `new: false`
            // console.log(doc); // , the document returned after updates if `new  true`
            // res.json(_displayResults(doc.imagesource));
            console.log('----------------' + email);
            server.send({
              text: 'i hope this works',
              from: 'advancedaquire@gmail.com',
              to: 'advancedaquire@gmail.com',
              // cc:      "else <else@your-email.com>",
              subject: 'testing emailjs'
            }, function (err, message) { console.log(err || message); });

            res.send(docs);
          }
        }
      );
    } else {
      res.status(201).json(_displayResults(_resultCode.USER_NOT_EXIST, 'This user doesnt exist'));
    }
  });
}
);

module.exports = router;
