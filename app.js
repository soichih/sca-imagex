#!/usr/bin/node

var express = require('express');
var exjwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var fs = require('fs');
var request = require('request');

/*
var local = require('./routes/local'); //local user/pass
var iucas = require('./routes/iucas');
var register = require('./routes/register');
var user = require('./routes/user');
*/

var config = require('./config/config').config;

var app = express();
app.use(logger(app.get('DEBUG'))); //TODO - pull it from config or app.get('env')?

app.use(bodyParser.json()); //parse application/json
app.use(bodyParser.urlencoded({ extended: false})); //parse application/x-www-form-urlencoded
app.use(cookieParser());

//authorize data access to imageid 
var auth_publicKey = fs.readFileSync('config/auth.pub');
var imagex_privatekey = fs.readFileSync('./config/imagex.key', {encoding: 'ascii'});
app.post('/authorize', exjwt({secret: auth_publicKey}), function(req, res) {
    var path = req.body.path;
    if(path) {
        //TODO - clean path?
        
        //if path doesn't end with /, add it - so that /something/123 doesn't give access to /something/12345
        //TODO - what sideeffect could this cause?
        if(path[path.length-1] != '/') path+='/';
        
        //console.log("requested authentication for "+id);
        //
        //TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO 
        //TODO - check authorization for this path!!
        //TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO 

        var claim = req.user; //let's usr user's current jwt as a template
        claim.exp = (Date.now() + config.access_token_ttl)/1000;
        claim.scopes.imagex = [path];
        //console.dir(req.user);
        var token = jwt.sign(claim, imagex_privatekey, {algorithm: 'RS256'});
        return res.json({access_token: token});
    } else {
        res.status(500);
        res.json({message:"please specify image path"});
    }
});

app.get('/health', function(req, res) {
    res.json({status: 'ok'});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
    console.dir(req.headers.authorization);
    console.dir(err);
    res.status(err.status || 500);
    res.json(err);
});

module.exports = app;

