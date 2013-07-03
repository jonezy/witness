var nconf = require('nconf'),
    http = require('http'),
    async = require('async');


// load the domains json file
nconf.file({file: process.cwd() + '/domains.json' });

var domains = nconf.get();
var results = {};

var resultTemplate = {
  status: "ok",
  cssClass: "success",
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
        doRequest(d, function(data) {
          results[d] = data;
          next();
        });
      } catch (e) {
        next(null);
      }
    },function(err) {
      if(err) console.log('ERROR ', err);
      res.render('domains', { title: 'Express', domains:domains, results: results });
    }
  );
};


function doRequest(url, cb) {
  var options = {
    host: url,
    port: 80,
    path: "/",
    method: "GET"
  };

  // do the request!
  var data = "";
  var apiReq = http.request(options, function(apiRes) {
    apiRes.setEncoding('utf8');
    apiRes.on('data', function(chunk) {
      data = resultTemplate;
    });
    apiRes.on('end', function() {
      // execute the callback
      cb && cb(data);
    });
  });

  apiReq.on('error', function(e) {
    data = { status: 'down', cssClass: 'error' };
    cb && cb(data);
  });

  apiReq.end();
}
