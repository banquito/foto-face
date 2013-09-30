var worksRepo = require('../models/worksRepo.js');

exports.index = function(req, res){
  var status = req.query.status;
  if (!status) status = "pending";
  worksRepo.getWorksByStatus(status, function(works) {
    res.render('admin', { 
      works: works,
      status: status,
      layout: 'layout_admin',
      action: "index"
    });
  });
};

exports.approve = function(req, res){
  var approvedWorks = [];
  if (req.body.works) {
    approvedWorks = req.body.works.toString().split(",");
  }
  
  worksRepo.approve(approvedWorks, function() {
    res.redirect('/admin/?status=' + req.body.status);
  });
};

exports.reject = function(req, res){
  var rejectedWorks = [];
  if (req.body.works) {
    rejectedWorks = req.body.works.toString().split(",");
  }
  
  worksRepo.reject(rejectedWorks, function() {
    res.redirect('/admin/?status=' + req.body.status);
  });
};

exports.ranking = function(req, res){
  worksRepo.getWorksByRanking(function(works) {
    res.render('ranking', { 
      works: works,
      layout: 'layout_admin',
      action: "ranking"
    });
  });
};
