var config = {};
/** * Database and collections ***/
// config.db_url = 'mongodb://localhost:27017/';
config.db_url = 'mongodb+srv://advancedaquire:diwifkdlktodqhs126@cluster0-3mh9m.mongodb.net/test?retryWrites=true&w=majority';
// config.db_url = 'mongodb+srv://rabiauser:yzzVNSbEnt2UsC11@clusterrab-luys6.mongodb.net/test?retryWrites=true&w=majority'
config.database = 'mydb';
config.collection = 'customers';
config.userCollection = 'users';
config.galleryCollection = 'galleries';
config.imageCollection = 'images';
config.orderCollection = 'orders';

/** user token authorization parameters **/
config.user_token = {
  issuer: 'http://localhost:8443',
  audience: 'http://localhost:8443'
};
/** * secret key for user authenticate ***/
config.secret_key = 'howareyouusernamepassword';

/** * JWT authorization setting ***/
config.issuer = 'http://auth-dev.jpos.io';
config.jwksUri = 'http://auth-dev.jpos.io/.well-known/openid-configuration/jwks';

/** * Get new access token ***/
config.token_endpoint = 'http://auth-dev.jpos.io/connect/token';
config.params_to_get_new_access_token = {
  'grant_type': 'password',
  'username': 'alice',
  'password': 'Pass123$',
  'scope': 'POS.Hub.Api',
  'client_id': 'POSHubApi.User',
  'client_secret': 'P@ssw0rd!'
};

/** * Upload file size ***/
config.upload_file_max_size = 10 * 1024 * 1024;

/** * Result code of API response ***/
config.result_code = {
  /** * User create ***/
  EMAIL_UNDEFINED: 101, // email parameter is not defined
  PASSWORD_UNDEFINED: 102, // password parameter is not defined
  NAME_UNDEFINED: 103, // name parameter is not defined
  ROLE_UNDEFINED: 104, // phone number is not defined
  EMAIL_ALREADY_EXIST: 105, // a user with this email already exist
  USER_CREATED_SUCCESS: 106, // a user successfully created
  INSERT_IMAGE_SUCCESS: 108, // insert image in specific user
  USER_NOT_EXIST: 109, // doesn't exist with specific user_id
  /** * User create ***/
  GALLERYNAME_UNDEFINED: 111, // email parameter is not defined
  USERID_UNDEFINED: 112, // password parameter is not defined
  GALLERY_ALREADY_EXIST: 115,
  GALLERY_CREATED_SUCCESS: 116, // a gallery successfully created
  GALLERY_DELETE_SUCCESS: 117,
  GALLERY_ALREADY_DELETED: 118,
  IMAGES_DELETE_SUCCESS: 117,
  IMAGES_ALREADY_DELETED: 118,

  /** * User login ***/
  LOGIN_EMAIL_INVALID: 157, // email paramater is not defined
  LOGIN_PASSWORD_INVALID: 158, // password parameter is not defined
  LOGIN_GET_TOKEN_ERROR: 159, // error occurs when get token
  LOGIN_SUCCESS: 160, // user successfully logged in
  INVALID_USER_TOKEN: 161, // user token invalid
  USER_TOKEN_NO_PROVIDED: 162, // must set user token

  /** * Token authorization ***/
  NEED_AUTHORIZATION_HEADER: 210, // need to set authorization in header
  EXPECTED_BEARER_TOKEN: 211, // expected bearer token for authorization
  TOKEN_AUTHORIZATION_FAILED: 212, // token authorization failed

  /** * Order validate check and save ***/
  ORDER_EMPTY_OBJECT: 310, // orer accountId undefined
  ORDER_ACCOUNTID_NOT_MATCHED: 311, // order accountId not matched
  ORDER_VALIDATE_FAILED: 313, // can't validate order
  ORDER_VALIDATE_SUCCESS: 314, // order validated successfully
  ORDER_ALREADY_EXIST: 315, // order already exist
  ORDER_SAVED_SUCCESS: 316, // order successfully created
  ORDERS_GET_BY_USERID: 317, // get orders by userId(user email address)
  NO_ORDERS_MATCH_USERID: 381, // no orders matched userId
  ORDER_GET_STATUS_UNDEFINED: 382, // status undefined when get orders of status
  NO_PENDING_ORDERS: 383, // no orders of pending
  ORDERS_OF_PENGIND: 384, //  get orders of pending
  NO_SUCH_STATUS: 385, // no such status
  ORDERS_GET_BY_ORDERID: 386, // get orders by orderId
  NO_ORDERS_BY_ORDERID: 387, // no orders matched orderId

  /** * File upload and download ***/
  IMAGE_UPLOADED_SUCCESS: 410,
  IMAGE_ALREADY_EXIST: 411,
  FILE_UPLOAD_SUCCESS: 417, // file successfully uploaded
  FILE_DOWNLOAD_SUCCESS: 418, // file successfully download
  NO_SUCH_FILE: 419, // no such file in directory
  FILE_LIST_SUCCESS: 420, // successfully get list of files
  NO_SELECTED_UPLOAD_FILE: 421, // no selected file to upload
  ERROR_IN_FILE: 422, // occurs error
  SELECTED_ANOTHER_UPLOAD_FILE: 423,
  /** * query and save products ***/
  QUERY_SUCCESS: 511, // executed mongo query successfully
  QUERY_PARAMETER_REQUIRE: 512, // require some parameters
  SAVE_PRODUCT_SUCCESS: 513, // save products successfully
  QUERY_EXECUTION_ERROR: 514, // error occurs when mongo query

  FILE_DELETE_SUCCESS: 517

};

/** * For displaying result of API response ***/
function _displayResults (returnCode, data, result) {
  if (result === undefined) {
    result = false;
  }
  return {
    'result': result,
    'result_code': returnCode,
    'data': data
  };
}
config._displayResults = _displayResults;

module.exports = config;
