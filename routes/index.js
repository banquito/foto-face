var facebook = require('../models/facebook.js');
var worksRepo = require('../models/worksRepo.js');
var fs = require('fs');

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

var imagesPageSize = 15;

exports.index = function(req, res){
  var signedRequest = facebook.signedRequest(req);
  var liked = (signedRequest && signedRequest.page && signedRequest.page.liked);
  var userId = signedRequest ? signedRequest.user_id : null;
  var recommendedId;
  if (signedRequest && signedRequest.app_data && signedRequest.app_data) {
    recommendedId = signedRequest.app_data;
  }

  worksRepo.getRecommendedImage(userId, recommendedId, function(recommendedImage) {
    worksRepo.getImagesApproved(userId, 1, imagesPageSize, function(images) {
      res.render('index', { 
        app: facebook.app(),
        userId: userId,
        liked: liked,
        images: images,
        recommendedImage: recommendedImage
      });
    });
  });

};

exports.images = function(req, res){
  var signedRequest = facebook.signedRequest(req);
  var userId = signedRequest ? signedRequest.user_id : null;
  var page = req.query.page;
  worksRepo.getImagesApproved(userId, page, imagesPageSize, function(images) {
    res.render('images', { 
      images: images,
      userId: userId
    });
  });
};

exports.upload = function(req, res){
  var imageStream = fs.createReadStream(req.files['image'].path, { encoding: 'binary' });
  var cloudStream = cloudinary.uploader.upload_stream(function(image) {

    var user = { 
      name: req.body.nombre,
      lastname: req.body.apellido,
      city: req.body.ciudad,
      mail: req.body.mail,
      fbId: req.body.userId
    };

    worksRepo.save({user: user, cloudImage: image}, function (er, rs) {
      req.method = 'get'; 
      //res.redirect('/#miFoto');
      res.redirect('/');
    });
  });

  imageStream.on('data', cloudStream.write).on('end', cloudStream.end)
};

exports.vote = function(req, res){
  var signedRequest = facebook.signedRequest(req);
  var userId = signedRequest ? signedRequest.user_id : null;
  var workId = req.query.id;

  worksRepo.vote(workId, userId, function(status) {
    res.json({ status: status })
  });
};