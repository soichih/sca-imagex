#!/usr/bin/node

//os
var fs = require('fs');
var path = require('path');

//contrib
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var exjwt = require('express-jwt');
var jwt = require('jsonwebtoken');
//var logger = require('morgan');
//var request = require('request');
var winston = require('winston');
var expressWinston = require('express-winston');

//mine
var config = require('./config/config');
var logger = new winston.Logger(config.logger.winston);

var app = express();
app.use(bodyParser.json()); //parse application/json
app.use(bodyParser.urlencoded({ extended: false})); //parse application/x-www-form-urlencoded
app.use(expressWinston.logger(config.logger.winston));
app.use(cookieParser()); //not used?

//authorize data access to imageid 
app.post('/authorize', exjwt({secret: config.express.jwt.public_key}), function(req, res) {
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
        claim.exp = (Date.now() + config.imagex.access_token_ttl)/1000;
        claim.scopes.imagex = [path];
        //console.dir(req.user);
        var token = jwt.sign(claim, config.imagex.private_key, config.imagex.sign_opt);
        return res.json({access_token: token});
    } else {
        res.status(500);
        res.json({message:"please specify image path"});
    }
});

app.get('/health', function(req, res) { res.json({status: 'ok'}); });

//error handling
app.use(expressWinston.errorLogger(config.logger.winston));
app.use(function(err, req, res, next) {
    logger.info(err);
    logger.info(err.stack);
    res.status(err.status || 500);
    res.json({message: err.message, /*stack: err.stack*/}); //let's hide callstack for now
});

process.on('uncaughtException', function (err) {
    //TODO report this to somewhere!
    logger.error((new Date).toUTCString() + ' uncaughtException:', err.message)
    logger.error(err.stack)
    //process.exit(1); //some people think we should do this.. but I am not so sure..
})

exports.app = app;
exports.start = function() {
    //models.sequelize.sync(/*{force: true}*/).then(function() {
        var port = process.env.PORT || config.express.port || '8080';
        var host = process.env.HOST || config.express.host || 'localhost';
        app.listen(port, host, function() {
            console.log("Express server listening on port %d in %s mode", port, app.settings.env);
        });
    //});
}

