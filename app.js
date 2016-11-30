/*******************************************************************************
* Copyright (c) 2014 IBM Corporation and other Contributors.
*
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the Eclipse Public License v1.0
* which accompanies this distribution, and is available at
* http://www.eclipse.org/legal/epl-v10.html
*
* Contributors:
* IBM - Initial Contribution
*******************************************************************************/

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var Cloudant = require('cloudant');
var should = require('should');
var index = require('./routes/index');

var app = express();

//var me = 'e4859add-8f92-475c-b3bf-cb69a9c4aa8e-bluemix';
//var password = '580fc762b6d565141749df0b49d855f8e0acd3da0db6740c141c3474ccd0f25a';
/*
var me = '5d594679-db64-4ed8-a0d8-1cd09196d918-bluemix';
var password = '4bac2881ad82100778fc1b0d7e34f6066a7c718a7d12baf8acf02504d5cf1c87';

var cloudant = Cloudant({account:me, password:password});

cloudant.db.list(function(err, allDbs){
	console.log('All my DBs: %s', allDbs.join(', '))
});

var db = cloudant.db.use('iotp_znuylb_default_2016-11');

db.view('iotp','by-deviceId-and-date', {startkey: ['1',{}], endkey:['1'], descending:true, 'limit':10}, function (err, body) {
	body.rows.forEach(function(doc){
		console.log(doc.value);	
	});
});


db.view('iotp','by-date', {descending:true, 'limit':10}, function (err, body) {
	body.rows.forEach(function(doc){
		console.log(doc);	
	});
});


db.index(function(er, result) {
  if (er) {
    throw er;
  }

  console.log('The database has %d indexes', result.indexes.length);
  for (var i = 0; i < result.indexes.length; i++) {
    console.log('  %s (%s): %j', result.indexes[i].name, result.indexes[i].type, result.indexes[i].def);
  }

  result.should.have.a.property('indexes').which.is.an.Array;
});
*/


var http_host = (process.env.VCAP_APP_HOST || '0.0.0.0');
var http_port = (process.env.VCAP_APP_PORT || 7000);

app.set('port', http_port);
app.set('host',http_host);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//use favicon
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
// add session to store the api-key and auth token in the session
app.use(session({secret: 'iotfCloud123456789',saveUninitialized: true,
                 resave: true}));
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'Build')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/',index);

app.use(function(req, res, next) {
    if(req.session.api_key)
    res.redirect("/dashboard");
  else
    res.redirect('/login');
});

/// error handlers

// development error handler
// will print stacktrace
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
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(app.get('port'), app.get('host'), function() {
  console.log('Express server listening on ' + server.address().address + ':' + server.address().port);
});

module.exports = app;
