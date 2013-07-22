var nconf = require('nconf'),
    http = require('http'),
    https = require('https'),
    async = require('async'),
    Tackle = require('tackle');


// load the domains json file
nconf.file({file: process.cwd() + '/domains.json' });

var domains = nconf.get();
var results = {};
var reports = {};

var resultTemplate = {
  status: "ok",
  cssClass: "success",
  badgeClass: "success"
};

var errorTemplate = {
  status: 'down',
  cssClass: 'error',
  badgeClass: 'error'
};

var testDomains = [];
var i = 0;
for(var d in domains) {
  testDomains[i] = domains[d];
  i++;
}

exports.index = function(req, res){
  res.render('index');
};

exports.update = function(req, res) {
  async.forEachSeries(
    testDomains,
    function(d, next) {
      if(d.slice(0,5) !== 'https') {
        http.get(d, function(res) {
          handleResponse(res, d, next);
        }).on('error', function(err) {
          results[d] = errorTemplate;
          next();
        });
      } else {
        https.get(d, function(res) {
          handleResponse(res, d, next);
        }).on('error', function(err) {
          results[d] = errorTemplate;
          next();
        });
      }
    },function(err) {
      if(err) console.log('ERROR ', err);
      res.render('domains', { domains:domains, results: results, reports:reports, resultsDebug: JSON.stringify(reports, undefined, 2) });
    }
  );
};

var handleResponse = function(res, d, next) {
  if(res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 304)
    results[d] = resultTemplate;

  res.on('data', function(chunk) { });

  res.on('end', function() {
    var tackle = new Tackle(d, {limit:10,type:'script,link'});
    tackle.run(function(report) {
      reports[d] = report;

      next();
    });
  });
};
