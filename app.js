var express = require('express'), 
    cons = require('consolidate'),
    swig = require('swig'),
    http = require('http'),
    path = require('path');

var app =  express();
var routes = require('./routes')(app);

console.log(routes);
// all environments
app.set('port', process.env.PORT || 3000);
app.engine('.html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.responseTime());
app.use(app.router);
app.use(express.compress());
app.use(express.static(path.join(__dirname, 'public'), {maxAge: 31557600000}));

swig.init({
  root: __dirname +'/views',
  allowErrors: true
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  app.locals.isDebug = true;
}

app.get('/', routes.index);
app.get('/update', routes.update);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

