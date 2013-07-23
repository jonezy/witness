
module.exports = function(app) {
var async = require('async'),
    nconf = require('nconf'),
    http = require('http'),
    https = require('https'),
    moment = require('moment'),
    path = require('path'),
    Tackle = require('tackle');


exports.index = function(req, res) {
  res.render('index');
};

var domainsFile = 'domains.json';
if(app.get('env') === 'development') domainsFile = 'domains.local.json';
nconf.file({file: path.join(process.cwd() , domainsFile) });

var domains = nconf.get();
var results = {};
var reports = {};
var logs = [];

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
for(var d in domains) {
  testDomains.push(domains[d]);
}

var start,end;

exports.update = function(req, res) {
  start = new Date();
  async.forEachSeries(
    testDomains,
    function(d, next) {
      if(d.slice(0,5) !== 'https') {
        http.get(d, function(res) {
          handleResponse(res, d, next);
        }).on('error', function(err) {
          handleErrorResponse(err, next);
        });
      } else {
        https.get(d, function(res) {
          handleResponse(res, d, next);
        }).on('error', function(err) {
          handleErrorResponse(err, next);
        });
      }
    },function(err) {
      end = new Date();
      var duration = moment.duration(moment(end).diff(moment(start), 'minutes'), 'minutes').humanize();
      logs.push({ endTime:moment(end).format('h:mm a'),  duration:duration, status: 'info'});

      if(err) console.log('ERROR ', err);
      res.render('domains', { domains:domains, results: results, reports:reports, logs: logs, resultsDebug: JSON.stringify(reports, undefined, 2) });
    }
  );
};

var handleResponse = function(res, d, next) {
  if(res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 304)
    results[d] = resultTemplate;

  res.on('data', function(chunk) { });

  res.on('end', function() {
    var tackle = new Tackle(d, {limit:5,type:'script,link,img'});
    tackle.run(function(report) {
      report.failedCss = 'badge-success';
      if(report.failed.length > 0) report.failedCss = 'badge-important';

      reports[d] = report;

      next();
    });
  });
};

var handleErrorResponse = function(err, next) {
  results[d] = errorTemplate;
  var duration = moment.duration(moment(end).diff(moment(start), 'minutes'), 'minutes').humanize();
  logs.push({ endTime:end.toLocaleTimeString(),  duration:duration, status: 'error'});
  next();
};

return exports;
};
