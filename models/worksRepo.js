var mongo = require('mongodb');

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/foto-face';

var ObjectID = require('mongodb').ObjectID;

var status = {
  pending: 0,
  approved: 1,
  rejected: 2
};

var sortOptions = {
  "sort": [["createdAt", "desc"]]
};

var WorksRepo = function() {
  var works;
  var userVotes;

  mongo.Db.connect(mongoUri, function (err, db) {
    db.collection('works', function(er, collection) {
      works = collection;
    });

    db.collection('userVotes', function(er, collection) {
      userVotes = collection;
    });
  });

  this.getRecommendedImage = function (userId, workId, callback) {
    var _id;
    try {
      _id = new ObjectID(workId)
    } catch (e) {
      callback(null);
      return;
    }
    userVotes.find({ "userId": userId }).toArray(function(err, myVotes) {
      works.findOne({ _id: _id }, function(err, work) {
        if (work) {
          var image = work.cloudImage.public_id + "." + work.cloudImage.format;
          var voted = false;
          myVotes.forEach(function(vote) {
            if (vote.workId == work._id.toString()) {
              voted = true;
            }
          });
          callback({ id:work._id, image: image, voted: voted });
        }
        callback(null);
      });
    });
  };

  this.getImagesApproved = function (userId, page, pageSize, callback) {
    userVotes.find({ "userId": userId }).toArray(function(err, myVotes) {

      var imagesApproved = { pagesCount: 0, items: [] };
      works.find({ "status": status.approved }, sortOptions, function(err, allResult) {
        allResult.count(function(err, count) {
          imagesApproved.pagesCount = Math.ceil(count / pageSize);
          works.find({ "status": status.approved }, sortOptions, function(err, paginatedResult) {
            
            paginatedResult.skip((page - 1) * pageSize)
            .limit(pageSize)
            .each(function(err, work) {
              
              if (work) {
                var image = work.cloudImage.public_id + "." + work.cloudImage.format;
                
                var voted = false;
                myVotes.forEach(function(vote) {
                  if (vote.workId == work._id.toString()) {
                    voted = true;
                  }
                });

                imagesApproved.items.push({ id:work._id, image: image, voted: voted });
              } else {
                callback(imagesApproved);
              }
            });
          });
        });
        
      });
    });
  };

  this.getWorksByStatus = function (statusDesc, callback) {
    var criteria = { status: null };

    if (statusDesc == "pending") {
      criteria.status = status.pending;
    } else if (statusDesc == "approved") {
      criteria.status = status.approved;
    } else if (statusDesc == "rejected") {
      criteria.status = status.rejected;
    }

    var result = [];
    works.find(criteria, sortOptions, function(err, rs) {
      rs.each(function(err, work) {
        if (work) {
          result.push(work);
        } else {
          callback(result);
        }
      });
    });
  };
  
  this.save = function (work, callback) {
    work.status = status.pending;
    work.createdAt = new Date();
    work.votes = 0;
    works.insert(work, {safe: true}, function(er,rs) {
      callback(er,rs);
    });
  };

  this.approve = function (worksToApprove, callback) {
    worksToApprove.forEach(function(workId, index) {
      works.update({_id: new ObjectID(workId)}, {$set: { status: status.approved }});
    });
    callback();
  };

  this.reject = function (worksToReject, callback) {
    worksToReject.forEach(function(workId, index) {
      works.update({_id: new ObjectID(workId)}, {$set: { status: status.rejected }});
    });
    callback();
  };

  this.vote = function (workId, userId, callback) {
    
    userVotes.findOne({ workId: workId, userId: userId }, function(err, result) {
      if (!result) {
        works.findAndModify(
          { _id: new ObjectID(workId) }, 
          {},
          { $inc: { votesCount: 1 } }, 
          {},
          function(err, result) {
            userVotes.insert({ workId: workId, userId: userId }, {safe: true}, function(er,rs) {
              callback(true);
            });
          }
        );
      } else {
        callback(false)
      }
    }) 

    
  };

  this.getWorksByRanking = function (callback) {
    var criteria = { status: status.approved };
    var sortOptions = {
      "sort": [["votesCount", "desc"]]
    };
    var result = [];
    works.find(criteria, sortOptions, function(err, rs) {
      rs.limit(100)
        .each(function(err, work) {
        if (work) {
          result.push(work);
        } else {
          callback(result);
        }
      });
    });
  };
};

module.exports = new WorksRepo();