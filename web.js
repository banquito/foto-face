
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var routesAdmin = require('./routes/admin.js');
var http = require('http');
var path = require('path');
var expressLayouts = require('express-ejs-layouts');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('layout', 'layout');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.use(expressLayouts);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(function (req, res, next) {
  res.locals.host = function() {
    return req.headers['host'];
  };

  res.locals.scheme = function() {
    return req.headers['x-forwarded-proto'] || 'http';
  };

  res.locals.url = function(path) {
    return res.locals.scheme() + res.locals.url_no_scheme(path);
  };

  res.locals.url_no_scheme = function(path) {
    return '://' + res.locals.host() + (path || '');
  };

  app.locals.image_crop = function(img, width, height) {
    return cloudinary.image(img, { width: width, height: height, crop: "fill" }).replace("http://", "https://");
  };

  app.locals.prettyDate = function(date) {
    var day = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    var hour = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return day + " " + hour;
  };

  next();
});

// app.router tiene que estar después de setear res.locals
app.use(app.router);

// front end
app.get('/', routes.index);
app.post('/', routes.index);
app.post('/upload', routes.upload);
app.get('/like/:image', routes.index);
app.get('/images', routes.images);
app.get('/votar', routes.vote);

// backend
var express = require('express');
var basicAuth = express.basicAuth;
var auth = function(req, res, next) {
  basicAuth(function(user, pass, callback) {
    callback(null, user === 'bic' && pass === '1234');
  })(req, res, next);
};

app.get('/admin/', auth, routesAdmin.index);
app.post('/admin/approve', auth, routesAdmin.approve);
app.post('/admin/reject', auth, routesAdmin.reject);
app.get('/admin/ranking', auth, routesAdmin.ranking);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
