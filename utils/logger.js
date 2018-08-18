var winston = require('winston');
var morgan = require('morgan');
var config = require('../config');
winston.emitErrs = true;

// created separate httpLogger because we want to log express request separatly
var httpLogger = new winston.Logger({
	transports: [new winston.transports.File({
		filename: config.get('logger.httpLogFileName'),
		json: true,
		maxsize: config.get('logger.logFileSize'),
		maxFiles: 5,
		colorize: true,
	})],
	exitOnError: false
});

var logger = {};
// Check whether elastic search logger is enabled or not
// By default it will enable file logger
// logger to log all other logs type from application to exception
logger = new winston.Logger({
	transports: [new winston.transports.File({
		level: 'error',
		filename: config.get('logger.logFileName'),
		json: true,
		maxsize: config.get('logger.logFileSize'),
		colorize: false,
	}), new winston.transports.Console({
		level: 'debug',
		json: false,
		colorize: true
	})],
	exceptionHandlers: [new winston.transports.File({
		filename: config.get('logger.exceptionLogFileName'),
		json: true,
		maxsize: config.get('logger.logFileSize'),
		colorize: true,
	})],
	exitOnError: false
});


// appender function to use winston file transport
var stream = {
	write: function (message, encoding) {
		httpLogger.info(message);
	}
};

// morgan is used to capture http log
morgan.format('full', config.get('logger.httpLogFormat'))
// wrapper function act as middleware for express
logger.startHttpLogger = function () {
	return morgan('full', {
		stream: stream
	});
};

module.exports = logger;