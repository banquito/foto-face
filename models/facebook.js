var FacebookModel = function() {
  this.app = function() {
    return {
      id: process.env.FACEBOOK_APP_ID,
      name: "Mi App",
      description: "Esta es mi app",
      shareUrl: process.env.FACEBOOK_APP_TAB_URL
    };
  };

  this.signedRequest = function(req) {
    var signed_request = req.body.signed_request;
    var forceLike = false;
    var forceLikeTo;
    var forceAppData = false;
    var forceAppDataTo;
    var postHasSignedRequest = true;
    
    // si no hay signed request, lo obtengo de cookie
    if (!signed_request) {
      postHasSignedRequest = false;
      signed_request = req.cookies["fbsr_" + process.env.FACEBOOK_APP_ID];
      if (signed_request) {
        var pastSignedRequest = decodeSignedRequest(req.session.signed_request);
        if (pastSignedRequest) {
          forceLike = true;
          forceLikeTo = pastSignedRequest.page.liked;
          forceAppData = true;
          forceAppDataTo = pastSignedRequest.app_data;
        }
      }
    }

    // si no hay signed request, lo obtengo de la session
    if (!signed_request) {
      signed_request = req.session.signed_request;
    }

    // Si el post tiene signed_request, guardo el signe_request en la session
    if (postHasSignedRequest) {
      req.session.signed_request = signed_request;
    }
    
    var signed_request_json = decodeSignedRequest(signed_request);
    
    if (forceLike) {
      signed_request_json.page = { liked: forceLikeTo };
    }

    if (forceAppData) {
      signed_request_json.app_data = forceAppDataTo;
    }

    if (process.env.test) {
      signed_request_json = {
        "algorithm":"HMAC-SHA256",
        "expires":1379653200,
        "issued_at":1379646050,
        "oauth_token":"1234",
        "page":{
          "id":"5678",
          "liked":true,
          "admin":true
        },
        "user":{
          "country":"ar",
          "locale":"es_LA",
          "age":{"min":21}
        },
        "user_id":"8",
        "app_data": "5241b62715428f0120000001"
      };
    }

    return signed_request_json;
  };

  var decodeSignedRequest = function(signed_request) {
    var signed_request_json =  null;
    if (signed_request) {
      var signed_request_parts = signed_request.split('.');
      var payload = signed_request_parts[1];
      var signed_request_raw_json = new Buffer(payload.replace(/\-/g, '+').replace(/\_/g, '/'), 'base64').toString('binary');
      signed_request_json = JSON.parse(signed_request_raw_json);
    }
    return signed_request_json;
  }
};

module.exports = new FacebookModel();