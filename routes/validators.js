const express = require('express');
const router = express.Router();
const amphtmlValidator = require('amphtml-validator');
const request = require('request');

/* GET validators listing. */
router.get('/', function(req, res, next) {
  res.write('URL Validator at: GET /validators/validate_url\n');
  res.end('TODO: Content Validator at: POST /validators/validate_content');
})
  .get('/validate_url', function(req, res, next) {
    var validation_url = req.query.url;
    var response = {
      valid: false,
      souce: validation_url,
      errors: []
    };
    
    amphtmlValidator.getInstance().then(function (validator) {
      var initializeValidation = initialize(validation_url);
    
      initializeValidation.then(function(result) {
        var validation = validator.validateString(result);
    
        if(validation.status === 'PASS') {
          console.log(validation.status);
          response.valid = true;
        } else {
          console.error(validation.status);
        }
    
        for (var ii = 0; ii < validation.errors.length; ii++) {
          var error = validation.errors[ii];
          error_msg = {
            line: error.line,
            col: error.col,
            error: error.message,
            code: error.category,
            severity: error.severity
          };
    
          if (error.specUrl !== null) {
           error_msg.help = error.specUrl;
          }
          ((error.severity === 'ERROR') ? console.error : console.warn)(error_msg);
          response.errors.push(error_msg);
          error_msg = {};
        }
    
        res.statusCode = 200;
        res.send(response);
      }, function(err) {
        console.log(err);
        res.statusCode = 400;
        res.send(err.message);
      });
    })
});

function initialize(post_url) {
  // Setting URL and headers for request
  var options = {
    url: post_url,
    headers: {
      'User-Agent': 'request'
    }
  };
  // Return new promise
  return new Promise(function(resolve, reject) {
    // Do async job
    request.get(options, function(err, resp, body) {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    })
  })
}

module.exports = router;
