var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser  = require('body-parser');
var cors = require('cors');
var routes = require('./routes/index');
var users = require('./routes/users');
var Busboy = require('busboy');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())


app.use('/users', users);
app.post('/', function(req, res, next){
    console.log("in POST", req.headers, req.params, req.query);
    var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
	console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
	file.on('data', function(data) {
            console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
            //console.log(data.toString());
	});
	file.on('end', function() {
            console.log('File [' + fieldname + '] Finished');
	});
    });
    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
	console.log('Field [' + fieldname + ']: value: ' + val.toString());
    });
    busboy.on('finish', function() {
	console.log('Done parsing form!');
	res.writeHead(202, { Connection: 'close', Location: '/' });
	res.end();
    });
    req.pipe(busboy);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (false)
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
if (false)
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var   http =        require('http')
var server = http.createServer(app);
app.set('port',8000);
server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
})

module.exports = app;
