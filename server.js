var http = require('http');
var express = require('express');
var util = require('util');
var config = require('./config');
var logger = require('./utils/logger');
var middlewares = require('./middlewares/index');
var routes = require('./routes/index');
var app = express();

//set port
app.set('port', config.get('server.port'));

//set proxy server
app.set('trust proxy', true);

//setup middlewares
middlewares(app);

//setup routes
routes(app);

http.createServer(app).listen(app.get('port'), () => {
    logger.info(util.format('API Started with Process Id %s And listening At Port %s', process.pid, app.get('port')));
    logger.info(util.format('Environmment :- %s', config.get('env')));
});