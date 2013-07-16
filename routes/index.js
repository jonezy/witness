var nconf = require('nconf'),
    http = require('http'),
    https = require('https'),
    async = require('async'),
    Tackle = require('tackle');


// load the domains json file
nconf.file({file: process.cwd() + '/domains.json' });

var domains = nconf.get();
var results = {};

var resultTemplate = {
  status: "ok",
  cssClass: "success",
  badgeClass: "success"
};

var testDomains = [];
var i = 0;
for(var d in domains) {
  testDomains[i] = domains[d];
  i++;
}

exports.index = function(req, res){
  res.render('index', { title: 'Express'});
};

exports.update = function(req, res) {
  async.forEachSeries(
    testDomains,
    function(d, next) {
      console.log('Testing ', d);
      try {
        if(d.slice(0, 5) === 'https') {
          https.get(d, function(res) {
            handleResponse(res, d, next);
          }).on('error', function(e) {
            data = { status: 'down', cssClass: 'error', badgeClass: 'important' };
          });
        } else {
          http.get(d, function(res) {
            handleResponse(res, d, next);
          }).on('error', function(e) {
            data = { status: 'down', cssClass: 'error', badgeClass: 'important' };
          });
        }
      } catch (e) {
        next(null);
      }
    },function(err) {
      if(err) console.log('ERROR ', err);
      res.render('domains', { title: 'Express', domains:domains, results: results });
    }
  );
};

var handleResponse = function(res, d, next) {

        var data = "";
          res.on('data', function(chunk) {
            data = resultTemplate;
          });
          res.on('end', function() {
            Tackle(d, {limit: 3}, function(report) {
              results[d] = data;
              next();
            });
          });
}
