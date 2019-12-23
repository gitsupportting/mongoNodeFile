var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');
var Path = require('path');
var uniqid = require('uniqid');
var config = require('../config');
var db = require('../db');
var _resultCode = config.result_code;
var _displayResults = config._displayResults;
var menufile = 'menu.json';

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }

    var user_id = req.body.user_id;
    var dir = 'uploads/' + user_id;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    var GalleryName = req.body.GalleryName;
    var dir = 'uploads/' + user_id + '/' + GalleryName;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    var filename = req.params.filename;
    if (filename === undefined) {
      filename = menufile;
    }
    // console.log(file);
    // var type = path.extname(file.originalname);
    cb(null, filename);
  }
});

var maxSize = config.upload_file_max_size;
var upload = multer({ storage: storage, limits: { fileSize: maxSize } });

/** ************************ file uplaod and download route *************************/
/* file upload : POST */
router.post('/files/:filename', upload.single('file'), function (req, res) {
  if (req.file) {
    var user_id = req.body.user_id;
    var GalleryName = req.body.GalleryName;
    var gallery_id = req.body.gallery_id;
    var filename = req.params.filename;

    var collection = db.get().collection(config.imageCollection);
    var query = { 'user_id': user_id, 'GalleryName': GalleryName, 'filename': filename, 'gallery_id': gallery_id };
    collection.find(query).toArray(function (_err, docs) {
      if (docs.length === 0) {
        query = { 'image_id': uniqid.time(), 'user_id': user_id, 'gallery_id': gallery_id, 'GalleryName': GalleryName, 'filename': filename };
        collection.insertOne(query, function (_err, inserted) {
          // res.json(_displayResults(_resultCode.IMAGE_UPLOADED_SUCCESS, 'Successfully uploaded', true));
        });
      } else {
        // res.status(201).json(_displayResults(_resultCode.IMAGE_ALREADY_EXIST, 'This image already exist'));
      }
    });
    res.json(_displayResults(_resultCode.FILE_UPLOAD_SUCCESS, 'Successfully uploaded', true));
  } else {
    res.status(405).json(_displayResults(_resultCode.NO_SELECTED_UPLOAD_FILE, "Please select file(key='file') to upload"));
  }
});

/* get images :  Get */
router.get('/files/images', (req, res) => {
  // var user_id = req.body.user_id;
  // var GalleryName = req.body.GalleryName;
  var collection = db.get().collection(config.imageCollection);
  // var query = { 'user_id': user_id, 'GalleryName': GalleryName };
  collection.find().toArray((err, results) => {
    res.send(results);
  });
});
/* file upload : POST */
// router.post('/files/:filename', upload.single('file'), function (req, res) {
//   if (req.file) {
//     var collection = db.get().collection(config.userCollection);
//     var query = { 'user_id': req.body.user_id };
//     var already = 0;
//     collection.find(query).toArray(function (_err, docs) {
//       var splitImageSource = (docs[0].imagesource).split("#");
//       for (let i = 0; i < splitImageSource.length; i++) {
//         if (splitImageSource[i] == 'uploads/' + req.params.filename) {
//           already = 1;
//         }
//       }
//       if (docs.length !== 0) {
//         if (already == 0) {
//           collection.findOneAndUpdate(
//             { "user_id": req.body.user_id },
//             { "$set": { "imagesource": docs[0].imagesource + 'uploads/' + req.params.filename + '#' } },
//             // { "new": true },
//             function (err, doc) {
//               if (err) { // err: any errors that occurred
//                 console.log(err);
//                 // res.json(_displayResults(err));
//               } else { // doc: the document before updates are applied if `new: false`
//                 console.log(doc); // , the document returned after updates if `new  true`
//                 // res.json(_displayResults(doc.imagesource));
//               }
//             }
//           );
//         }
//       } else {
//         res.status(201).json(_displayResults(_resultCode.USER_NOT_EXIST, 'This user doesnt exist'));
//       }
//     });
//     setTimeout(() => {
//       res.json(_displayResults(_resultCode.FILE_UPLOAD_SUCCESS, 'Successfully uploaded, ' + 'path: ' + 'uploads/' + req.params.filename, true));
//     }, 100);

//   } else {
//     res.status(405).json(_displayResults(_resultCode.NO_SELECTED_UPLOAD_FILE, "Please select file(key='file') to upload"));
//   }
// });

// router.post('/files/delete/:filename', function (req, res) {
//   var collection = db.get().collection(config.userCollection);
//   var query = { 'user_id': req.body.user_id };
//   var already = 0;
//   collection.find(query).toArray(function (_err, docs) {
//     var splitImageSource = (docs[0].imagesource).split("#");
//     for (let i = 0; i < splitImageSource.length; i++) {
//       if (splitImageSource[i] == 'uploads/' + req.params.filename) {
//         already = 1;
//       }
//     }
//     // if (docs.length !== 0) {
//     //   if (already == 0) {
//     //     collection.findOneAndUpdate(
//     //       { "user_id": req.body.user_id },
//     //       { "$set": { "imagesource": docs[0].imagesource + 'uploads/' + req.params.filename + '#' } },
//     //       // { "new": true },
//     //       function (err, doc) {
//     //         if (err) { // err: any errors that occurred
//     //           console.log(err);
//     //           // res.json(_displayResults(err));
//     //         } else { // doc: the document before updates are applied if `new: false`
//     //           console.log(doc); // , the document returned after updates if `new  true`
//     //           // res.json(_displayResults(doc.imagesource));
//     //         }
//     //       }
//     //     );
//     //   }
//     // } else {
//     //   res.status(201).json(_displayResults(_resultCode.USER_NOT_EXIST, 'This user doesnt exist'));
//     // }
//   });
//   setTimeout(() => {
//     res.json(_displayResults(_resultCode.FILE_DELETE_SUCCESS, 'Successfully deleted' + req.params.filename, true));
//   }, 100);
// }
// );

/* file download : GET */
router.get('/files/:filename', function (req, res) {
  var accountId = req.oauth_decoded.pos_client_id;
  var filename = req.params.filename;
  var file = 'uploads/' + accountId + '/' + filename;
  if (!fs.existsSync(file)) {
    return res.json(_displayResults(_resultCode.NO_SUCH_FILE, 'No such file'));
  }
  res.download(file, function (err) {
    console.log('err', err);
    // if (err !== undefined) {
    //   return res.json(_displayResults(_resultCode.NO_SUCH_FILE, err));
    // }
    res.end();
  }); // Set disposition and send it.
});

/* get file list of accountId : GET */
router.get('/files', function (req, res) {
  var accountId = req.oauth_decoded.pos_client_id;
  var dir = 'uploads/' + accountId;
  var filelist = [];
  if (!fs.existsSync(dir)) {
    res.json(_displayResults(_resultCode.FILE_LIST_SUCCESS, filelist));
  } else {
    fs.readdir(dir, (_err, files) => {
      files.forEach(file => {
        filelist.push(file);
      });
      res.json(_displayResults(_resultCode.FILE_LIST_SUCCESS, filelist));
    });
  }
});

/* file upload : POST */
// router.post('/files/:filename', upload.single('file'), function (req, res) {
//   if (req.file) {
//     var collection = db.get().collection(config.userCollection);
//     var query = { 'user_id': req.body.user_id };
//     var already = 0;
//     collection.find(query).toArray(function (_err, docs) {
//       var splitImageSource = (docs[0].imagesource).split("#");
//       for (let i = 0; i < splitImageSource.length; i++) {
//         if (splitImageSource[i] == 'uploads/' + req.params.filename) {
//           already = 1;
//         }
//       }
//       if (docs.length !== 0) {
//         if (already == 0) {
//           collection.findOneAndUpdate(
//             { "user_id": req.body.user_id },
//             { "$set": { "imagesource": docs[0].imagesource + 'uploads/' + req.params.filename + '#' } },
//             // { "new": true },
//             function (err, doc) {
//               if (err) { // err: any errors that occurred
//                 console.log(err);
//                 // res.json(_displayResults(err));
//               } else { // doc: the document before updates are applied if `new: false`
//                 console.log(doc); // , the document returned after updates if `new  true`
//                 // res.json(_displayResults(doc.imagesource));
//               }
//             }
//           );
//         }
//       } else {
//         res.status(201).json(_displayResults(_resultCode.USER_NOT_EXIST, 'This user doesnt exist'));
//       }
//     });
//     setTimeout(() => {
//       res.json(_displayResults(_resultCode.FILE_UPLOAD_SUCCESS, 'Successfully uploaded, ' + 'path: ' + 'uploads/' + req.params.filename, true));
//     }, 100);

//   } else {
//     res.status(405).json(_displayResults(_resultCode.NO_SELECTED_UPLOAD_FILE, "Please select file(key='file') to upload"));
//   }
// });

/** ************************ menu route *************************/
/* menu.json file upload : POST */
router.post('/menu', function (req, res) {
  var menu = req.body;
  if (isEmpty(menu)) {
    res.status(405).json(_displayResults(_resultCode.NO_SELECTED_UPLOAD_FILE, 'Invalid input'));
    return;
  }
  var accountId = req.oauth_decoded.pos_client_id;
  var fileDir = 'uploads/' + accountId + '/' + menufile;
  fs.writeFile(fileDir, JSON.stringify(menu), function (_err) {
    if (_err) {
      console.log('An error occured while writing JSON Object to File.');
      res.status(201).json(_displayResults(_resultCode.ERROR_IN_FILE, _err));
      return;
    }
    res.json(_displayResults(_resultCode.FILE_UPLOAD_SUCCESS, 'Successfully saved', true));
  });
});

/* menu.json file download : GET */
router.get('/menu', function (req, res) {
  var accountId = req.oauth_decoded.pos_client_id;
  var filename = menufile;
  var file = 'uploads/' + accountId + '/' + filename;
  console.log('file', file);
  if (!fs.existsSync(file)) {
    return res.json(_displayResults(_resultCode.NO_SUCH_FILE, 'No such file'));
  }
  res.download(file, function (err) {
    console.log('err', err);
    // if (err !== undefined) {
    //   return res.json(_displayResults(_resultCode.NO_SUCH_FILE, err));
    // }
    res.end();
  }); // Set disposition and send it.
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
